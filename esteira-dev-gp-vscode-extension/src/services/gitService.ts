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

    isGhAuthenticated(): boolean {
        try {
            execSync('gh auth status', {
                cwd: this._workspaceRoot,
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe',
            });
            return true;
        } catch {
            return false;
        }
    }

    ghGetUser(): string | null {
        try {
            const login = execSync('gh api user -q .login', {
                cwd: this._workspaceRoot,
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe',
            }).trim();
            return login || null;
        } catch {
            return null;
        }
    }

    ghCreateRepo(name: string, isPrivate: boolean): void {
        if (/[;&|`$(){}!<>\\]/.test(name)) {
            throw new Error(`Nome de repositório inválido: "${name}"`);
        }
        const visibility = isPrivate ? '--private' : '--public';
        execSync(`gh repo create "${name.replace(/"/g, '\\"')}" ${visibility} --source=. --push`, {
            cwd: this._workspaceRoot,
            encoding: 'utf8',
            timeout: 30000,
        });
    }

    ghLogin(): void {
        const terminal = vscode.window.createTerminal({ name: 'GitHub Login', cwd: this._workspaceRoot });
        terminal.sendText('gh auth login');
        terminal.show();
    }

    ghCreatePr(base: string, title: string, body: string): string {
        if (/[;&|`$(){}!<>\\]/.test(base)) {
            throw new Error(`Branch base inválida: "${base}"`);
        }
        const head = this.getCurrentBranch();
        const safeBase = base.replace(/"/g, '\\"');
        const safeTitle = title.replace(/"/g, '\\"');
        const safeBody = body.replace(/"/g, '\\"');
        const result = execSync(
            `gh pr create --base "${safeBase}" --head "${head}" --title "${safeTitle}" --body "${safeBody}"`,
            {
                cwd: this._workspaceRoot,
                encoding: 'utf8',
                timeout: 30000,
                stdio: 'pipe',
            },
        );
        return result.trim();
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

    // ── GitHub PR Operations ────────────────────────────────────

    ghListPrs(): GhPrListItem[] {
        const fields = 'number,title,author,baseRefName,headRefName,isDraft,state,labels,reviewDecision,url';
        const raw = execSync(
            `gh pr list --json ${fields} --limit 30`,
            { cwd: this._workspaceRoot, encoding: 'utf8', timeout: 30000, stdio: 'pipe' },
        );
        const parsed = JSON.parse(raw);
        return (parsed as Array<Record<string, unknown>>).map(pr => ({
            number: pr.number as number,
            title: pr.title as string,
            author: ((pr.author as Record<string, string>)?.login) ?? 'unknown',
            baseRefName: pr.baseRefName as string,
            headRefName: pr.headRefName as string,
            isDraft: pr.isDraft as boolean,
            state: pr.state as string,
            labels: ((pr.labels as Array<Record<string, string>>) ?? []).map(l => l.name),
            reviewDecision: (pr.reviewDecision as string) ?? '',
            url: pr.url as string,
        }));
    }

    ghGetPrDetail(prNumber: number): GhPrDetail {
        if (!Number.isInteger(prNumber) || prNumber <= 0) {
            throw new Error(`Número de PR inválido: ${prNumber}`);
        }
        const fields = 'number,title,body,author,baseRefName,headRefName,isDraft,state,labels,reviewDecision,url,mergeable,statusCheckRollup,comments,reviews';
        const raw = execSync(
            `gh pr view ${prNumber} --json ${fields}`,
            { cwd: this._workspaceRoot, encoding: 'utf8', timeout: 30000, stdio: 'pipe' },
        );
        const pr = JSON.parse(raw) as Record<string, unknown>;
        return {
            number: pr.number as number,
            title: pr.title as string,
            body: (pr.body as string) ?? '',
            author: ((pr.author as Record<string, string>)?.login) ?? 'unknown',
            baseRefName: pr.baseRefName as string,
            headRefName: pr.headRefName as string,
            isDraft: pr.isDraft as boolean,
            state: pr.state as string,
            labels: ((pr.labels as Array<Record<string, string>>) ?? []).map(l => l.name),
            reviewDecision: (pr.reviewDecision as string) ?? '',
            url: pr.url as string,
            mergeable: (pr.mergeable as string) ?? 'UNKNOWN',
            statusCheckRollup: ((pr.statusCheckRollup as Array<Record<string, string>>) ?? []).map(c => ({
                name: c.name ?? c.context ?? 'check',
                status: c.status ?? '',
                conclusion: c.conclusion ?? '',
            })),
            comments: ((pr.comments as Array<Record<string, unknown>>) ?? []).map(c => ({
                author: ((c.author as Record<string, string>)?.login) ?? 'unknown',
                body: (c.body as string) ?? '',
                createdAt: (c.createdAt as string) ?? '',
            })),
            reviews: ((pr.reviews as Array<Record<string, unknown>>) ?? []).map(r => ({
                author: ((r.author as Record<string, string>)?.login) ?? 'unknown',
                body: (r.body as string) ?? '',
                state: (r.state as string) ?? '',
                createdAt: (r.submittedAt as string) ?? (r.createdAt as string) ?? '',
            })),
        };
    }

    ghMergePr(prNumber: number, method: 'merge' | 'squash' | 'rebase'): string {
        if (!Number.isInteger(prNumber) || prNumber <= 0) {
            throw new Error(`Número de PR inválido: ${prNumber}`);
        }
        const allowedMethods = ['merge', 'squash', 'rebase'];
        if (!allowedMethods.includes(method)) {
            throw new Error(`Método de merge inválido: ${method}`);
        }
        const result = execSync(
            `gh pr merge ${prNumber} --${method}`,
            { cwd: this._workspaceRoot, encoding: 'utf8', timeout: 30000, stdio: 'pipe' },
        );
        return result.trim();
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
