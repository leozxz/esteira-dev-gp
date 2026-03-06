import { execSync } from 'child_process';
import * as vscode from 'vscode';

export interface GitFileStatus {
    file: string;
    status: string;      // M, A, D, R, ??
    staged: boolean;
}

// ── PR-related interfaces ───────────────────────────────────

export interface GhPrListItem {
    number: number;
    title: string;
    author: string;
    baseRefName: string;
    headRefName: string;
    isDraft: boolean;
    state: string;          // OPEN, CLOSED, MERGED
    labels: string[];
    reviewDecision: string; // APPROVED, CHANGES_REQUESTED, REVIEW_REQUIRED, ''
    url: string;
}

export interface GhPrComment {
    author: string;
    body: string;
    createdAt: string;
}

export interface GhPrReview {
    author: string;
    body: string;
    state: string;   // APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING
    createdAt: string;
}

export interface GhStatusCheck {
    name: string;
    status: string;      // COMPLETED, IN_PROGRESS, QUEUED, etc.
    conclusion: string;  // SUCCESS, FAILURE, NEUTRAL, etc.
}

export interface GhPrDetail {
    number: number;
    title: string;
    body: string;
    author: string;
    baseRefName: string;
    headRefName: string;
    isDraft: boolean;
    state: string;
    labels: string[];
    reviewDecision: string;
    url: string;
    mergeable: string;   // MERGEABLE, CONFLICTING, UNKNOWN
    statusCheckRollup: GhStatusCheck[];
    comments: GhPrComment[];
    reviews: GhPrReview[];
}

export class GitService {
    private _workspaceRoot: string;

    constructor(workspaceRoot?: string) {
        this._workspaceRoot = workspaceRoot ?? this._getDefaultWorkspaceRoot();
    }

    get workspaceRoot(): string {
        return this._workspaceRoot;
    }

    private _getDefaultWorkspaceRoot(): string {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            throw new Error('Nenhum workspace aberto.');
        }
        return folders[0].uri.fsPath;
    }

    getWorkspaceRoot(): string {
        return this._workspaceRoot;
    }

    // ── Repo & User Info ──────────────────────────────────────────

    getGitUser(): { name: string; email: string } {
        let name = '';
        let email = '';
        try { name = this._exec('git config user.name').trim(); } catch { /* not configured */ }
        try { email = this._exec('git config user.email').trim(); } catch { /* not configured */ }
        return { name, email };
    }

    isGitRepo(): boolean {
        try {
            this._exec('git rev-parse --is-inside-work-tree');
            return true;
        } catch {
            return false;
        }
    }

    initRepo(): void {
        this._exec('git init');
    }

    getRemoteUrl(): string | null {
        try {
            const url = this._exec('git remote get-url origin').trim();
            return url || null;
        } catch {
            return null;
        }
    }

    addRemote(url: string): void {
        if (/[;&|`$(){}!<>\\]/.test(url)) {
            throw new Error(`URL inválida: "${url}"`);
        }
        this._exec(`git remote add origin "${url.replace(/"/g, '\\"')}"`);
    }

    // ── GitHub CLI ────────────────────────────────────────────────

    // ── GitHub auth via VS Code native API ─────────────────

    private _ghToken: string | undefined;
    private _ghUsername: string | undefined;

    async ghLogin(): Promise<boolean> {
        try {
            const session = await vscode.authentication.getSession('github', ['repo', 'read:user'], { createIfNone: true });
            this._ghToken = session.accessToken;
            this._ghUsername = session.account.label;
            return true;
        } catch {
            return false;
        }
    }

    async ghLogout(): Promise<void> {
        this._ghToken = undefined;
        this._ghUsername = undefined;
    }

    async isGhAuthenticated(): Promise<boolean> {
        try {
            const session = await vscode.authentication.getSession('github', ['repo', 'read:user'], { silent: true });
            if (session) {
                this._ghToken = session.accessToken;
                this._ghUsername = session.account.label;
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    getGhUsername(): string | undefined {
        return this._ghUsername;
    }

    getGhToken(): string | undefined {
        return this._ghToken;
    }

    // ── GitHub API helpers ──────────────────────────────────

    private _getOwnerRepo(): { owner: string; repo: string } {
        const remote = this._exec('git remote get-url origin').trim();
        // SSH: git@github.com:owner/repo.git  or  HTTPS: https://github.com/owner/repo.git
        const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (!match) { throw new Error(`Não foi possível extrair owner/repo de: ${remote}`); }
        return { owner: match[1], repo: match[2] };
    }

    private async _ghApi(path: string, options: { method?: string; body?: unknown } = {}): Promise<unknown> {
        if (!this._ghToken) { throw new Error('GitHub não autenticado.'); }
        const response = await fetch(`https://api.github.com${path}`, {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${this._ghToken}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`GitHub API ${response.status}: ${text}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }

    ghGetUser(): string | null {
        return this._ghUsername || null;
    }

    async ghCreatePr(base: string, title: string, body: string): Promise<string> {
        const { owner, repo } = this._getOwnerRepo();
        const head = this.getCurrentBranch();

        // Validate: branch must be published to remote
        try {
            this._exec(`git rev-parse --verify origin/${head}`);
        } catch {
            throw new Error(
                `A branch "${head}" não foi publicada no remoto. Execute "git push -u origin ${head}" antes de abrir o PR.`
            );
        }

        // Validate: branch must have commits ahead of base
        try {
            const ahead = this._exec(`git log origin/${base}..origin/${head} --oneline`).trim();
            if (ahead.length === 0) {
                throw new Error(
                    `A branch "${head}" não possui alterações em relação a "${base}". Não há nada para abrir um PR.`
                );
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Only re-throw our custom messages; ignore git errors (e.g. base not found)
            if (msg.includes('não possui alterações') || msg.includes('não foi publicada')) {
                throw err;
            }
        }

        try {
            const result = await this._ghApi(`/repos/${owner}/${repo}/pulls`, {
                method: 'POST',
                body: { title, body, head, base },
            }) as { html_url: string };
            return result.html_url;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Parse GitHub API error for user-friendly messages
            if (msg.includes('422')) {
                if (msg.includes('No commits between') || msg.includes('no commits')) {
                    throw new Error(
                        `Não há diferenças entre "${head}" e "${base}". Verifique se você fez push das suas alterações.`
                    );
                }
                if (msg.includes('A pull request already exists')) {
                    throw new Error(
                        `Já existe um Pull Request aberto de "${head}" para "${base}".`
                    );
                }
                if (msg.includes('merge conflict') || msg.includes('conflict')) {
                    throw new Error(
                        `Existem conflitos entre "${head}" e "${base}". Resolva os conflitos antes de abrir o PR.`
                    );
                }
            }
            throw err;
        }
    }

    getCurrentBranch(): string {
        return this._exec('git branch --show-current').trim();
    }

    getBranches(): string[] {
        const raw = this._exec('git branch --list');
        return raw
            .split('\n')
            .map(b => b.replace(/^\*?\s+/, '').trim())
            .filter(b => b.length > 0);
    }

    switchBranch(name: string): void {
        this._exec(`git switch ${this._sanitize(name)}`);
    }

    createBranch(name: string): void {
        this._exec(`git switch -c ${this._sanitize(name)}`);
    }

    getStatus(): GitFileStatus[] {
        const raw = this._exec('git status --porcelain');
        if (!raw.trim()) { return []; }

        return raw.split('\n').filter(l => l.length > 0).map(line => {
            const indexStatus = line[0];
            const workTreeStatus = line[1];
            const file = line.substring(3).trim();

            // If index has a letter (not space/?) → staged
            const staged = indexStatus !== ' ' && indexStatus !== '?';
            // Determine displayed status
            let status: string;
            if (staged) {
                status = indexStatus === '?' ? '??' : indexStatus;
            } else {
                status = workTreeStatus === '?' ? '??' : workTreeStatus;
            }

            return { file, status, staged };
        });
    }

    stageFile(file: string): void {
        this._exec(`git add -- ${this._sanitize(file)}`);
    }

    unstageFile(file: string): void {
        this._exec(`git restore --staged -- ${this._sanitize(file)}`);
    }

    stageAll(): void {
        this._exec('git add -A');
    }

    unstageAll(): void {
        this._exec('git reset HEAD');
    }

    commit(message: string): void {
        if (!message.trim()) {
            throw new Error('Mensagem de commit não pode ser vazia.');
        }
        execSync('git commit -F -', {
            cwd: this._workspaceRoot,
            encoding: 'utf8',
            input: message,
            maxBuffer: 10 * 1024 * 1024,
        });
    }

    push(): void {
        this._exec('git push');
    }

    pushSetUpstream(): void {
        const branch = this.getCurrentBranch();
        this._exec(`git push -u origin ${this._sanitize(branch)}`);
    }

    hasUpstream(): boolean {
        try {
            this._exec('git rev-parse --abbrev-ref @{u}');
            return true;
        } catch {
            return false;
        }
    }

    getDiffCached(): string {
        return this._exec('git diff --cached');
    }

    fetch(): void {
        this._exec('git fetch');
    }

    getRemoteBranches(): string[] {
        const raw = this._exec('git branch -r');
        return raw
            .split('\n')
            .map(b => b.trim())
            .filter(b => b.length > 0 && !b.includes('->'));
    }

    pull(branch: string): void {
        this._exec(`git pull origin ${this._sanitize(branch)}`);
    }

    // ── GitHub PR Operations (via REST API) ────────────────────

    async ghListPrs(): Promise<GhPrListItem[]> {
        const { owner, repo } = this._getOwnerRepo();
        const prs = await this._ghApi(`/repos/${owner}/${repo}/pulls?state=open&per_page=30`) as Array<Record<string, unknown>>;
        return prs.map(pr => ({
            number: pr.number as number,
            title: pr.title as string,
            author: ((pr.user as Record<string, string>)?.login) ?? 'unknown',
            baseRefName: ((pr.base as Record<string, string>)?.ref) ?? '',
            headRefName: ((pr.head as Record<string, string>)?.ref) ?? '',
            isDraft: (pr.draft as boolean) ?? false,
            state: ((pr.state as string) ?? 'open').toUpperCase(),
            labels: ((pr.labels as Array<Record<string, string>>) ?? []).map(l => l.name),
            reviewDecision: '',
            url: pr.html_url as string,
        }));
    }

    async ghGetPrDetail(prNumber: number): Promise<GhPrDetail> {
        if (!Number.isInteger(prNumber) || prNumber <= 0) {
            throw new Error(`Número de PR inválido: ${prNumber}`);
        }
        const { owner, repo } = this._getOwnerRepo();

        const [pr, reviews, comments] = await Promise.all([
            this._ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}`) as Promise<Record<string, unknown>>,
            this._ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`) as Promise<Array<Record<string, unknown>>>,
            this._ghApi(`/repos/${owner}/${repo}/issues/${prNumber}/comments`) as Promise<Array<Record<string, unknown>>>,
        ]);

        // Determine review decision from reviews
        const approvals = reviews.filter(r => r.state === 'APPROVED').length;
        const changesRequested = reviews.some(r => r.state === 'CHANGES_REQUESTED');
        let reviewDecision = '';
        if (changesRequested) { reviewDecision = 'CHANGES_REQUESTED'; }
        else if (approvals > 0) { reviewDecision = 'APPROVED'; }

        // Map mergeable_state
        const mergeableRaw = pr.mergeable as boolean | null;
        let mergeable = 'UNKNOWN';
        if (mergeableRaw === true) { mergeable = 'MERGEABLE'; }
        else if (mergeableRaw === false) { mergeable = 'CONFLICTING'; }

        // Get status checks from combined status + check runs
        const statusChecks: GhStatusCheck[] = [];
        try {
            const sha = ((pr.head as Record<string, unknown>)?.sha as string) ?? '';
            if (sha) {
                const checkRuns = await this._ghApi(`/repos/${owner}/${repo}/commits/${sha}/check-runs`) as Record<string, unknown>;
                const runs = (checkRuns.check_runs as Array<Record<string, unknown>>) ?? [];
                for (const run of runs) {
                    statusChecks.push({
                        name: (run.name as string) ?? 'check',
                        status: ((run.status as string) ?? '').toUpperCase(),
                        conclusion: ((run.conclusion as string) ?? '').toUpperCase(),
                    });
                }
            }
        } catch { /* non-critical */ }

        return {
            number: pr.number as number,
            title: pr.title as string,
            body: (pr.body as string) ?? '',
            author: ((pr.user as Record<string, string>)?.login) ?? 'unknown',
            baseRefName: ((pr.base as Record<string, string>)?.ref) ?? '',
            headRefName: ((pr.head as Record<string, string>)?.ref) ?? '',
            isDraft: (pr.draft as boolean) ?? false,
            state: ((pr.state as string) ?? 'open').toUpperCase(),
            labels: ((pr.labels as Array<Record<string, string>>) ?? []).map(l => l.name),
            reviewDecision,
            url: pr.html_url as string,
            mergeable,
            statusCheckRollup: statusChecks,
            comments: comments.map(c => ({
                author: ((c.user as Record<string, string>)?.login) ?? 'unknown',
                body: (c.body as string) ?? '',
                createdAt: (c.created_at as string) ?? '',
            })),
            reviews: reviews.map(r => ({
                author: ((r.user as Record<string, string>)?.login) ?? 'unknown',
                body: (r.body as string) ?? '',
                state: (r.state as string) ?? '',
                createdAt: (r.submitted_at as string) ?? '',
            })),
        };
    }

    async ghMergePr(prNumber: number, method: 'merge' | 'squash' | 'rebase'): Promise<string> {
        if (!Number.isInteger(prNumber) || prNumber <= 0) {
            throw new Error(`Número de PR inválido: ${prNumber}`);
        }
        const { owner, repo } = this._getOwnerRepo();
        const result = await this._ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
            method: 'PUT',
            body: { merge_method: method },
        }) as { sha: string; message: string };
        return result.message || `Merged (${result.sha})`;
    }

    private _exec(cmd: string): string {
        try {
            return execSync(cmd, {
                cwd: this._workspaceRoot,
                encoding: 'utf8',
                timeout: 30000,
                maxBuffer: 10 * 1024 * 1024, // 10MB
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Erro ao executar "${cmd}": ${msg}`);
        }
    }

    private _sanitize(value: string): string {
        // Prevent shell injection: only allow safe branch/file name characters
        if (/[;&|`$(){}!<>\\]/.test(value)) {
            throw new Error(`Valor inválido: "${value}"`);
        }
        return `"${value.replace(/"/g, '\\"')}"`;
    }
}
