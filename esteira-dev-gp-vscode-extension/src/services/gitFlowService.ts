import { exec } from 'child_process';
import * as vscode from 'vscode';

// ── Tipos de retorno ────────────────────────────────────────

export interface StepInfo {
    step: string;
    status: 'running' | 'done' | 'error';
}

export interface CreateBranchResult {
    success: boolean;
    message: string;
    branchName?: string;
    steps?: StepInfo[];
}

export interface MergeResult {
    success: boolean;
    message: string;
    hasConflicts?: boolean;
    alreadyMerged?: boolean;
    wasInHml?: boolean;
    suggestion?: string;
    currentBranch?: string;
    mergeBranch?: string;
}

export interface GitStatus {
    branch: string;
    hasChanges: boolean;
    status: string;
}

// ── Serviço Git Flow ────────────────────────────────────────

export class GitFlowService {
    private _getWorkspacePath(): string {
        const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!folder) {
            throw new Error('Nenhum workspace aberto.');
        }
        return folder;
    }

    private _getProjectCode(): string {
        const config = vscode.workspace.getConfiguration('cportGitFlow');
        return (config.get<string>('projectCode') || 'cport').toLowerCase();
    }

    // ── Comandos Git base ───────────────────────────────────

    private _runGit(args: string, cwd?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const workspacePath = cwd || this._getWorkspacePath();
            exec(`git ${args}`, { cwd: workspacePath, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(stderr || error.message));
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    async getCurrentBranch(): Promise<string> {
        return this._runGit('rev-parse --abbrev-ref HEAD');
    }

    async isGitRepo(): Promise<boolean> {
        try {
            await this._runGit('rev-parse --git-dir');
            return true;
        } catch {
            return false;
        }
    }

    async getStatus(): Promise<GitStatus> {
        try {
            const branch = await this.getCurrentBranch();
            const status = await this._runGit('status --short');
            return { branch, hasChanges: status.length > 0, status };
        } catch {
            return { branch: 'unknown', hasChanges: false, status: '' };
        }
    }

    private async _isMergedInto(source: string, target: string): Promise<boolean> {
        try {
            await this._runGit('fetch origin');

            // Verifica pelos commits: lista os commits exclusivos da source que
            // ainda NÃO estão em target. Se não houver nenhum, todas as
            // alterações já foram incorporadas (mesmo via branch merge/).
            const unmergedCommits = await this._runGit(
                `log origin/${target}..origin/${source} --oneline`
            );
            return unmergedCommits.trim().length === 0;
        } catch {
            return false;
        }
    }

    private async _checkConflicts(source: string, target: string): Promise<boolean> {
        try {
            const mergeBase = await this._runGit(`merge-base origin/${target} origin/${source}`);
            if (!mergeBase) { return false; }
            const result = await this._runGit(`merge-tree ${mergeBase} origin/${target} origin/${source}`);
            return result.includes('<<<<<<<') || result.includes('>>>>>>>') || result.includes('=======');
        } catch {
            return false;
        }
    }

    async getRemoteUrl(): Promise<string | null> {
        try {
            const url = await this._runGit('remote get-url origin');
            // Convert SSH to HTTPS format
            const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/.]+)/);
            if (sshMatch) {
                return `https://github.com/${sshMatch[1]}/${sshMatch[2]}`;
            }
            // Remove .git suffix from HTTPS
            return url.replace(/\.git$/, '');
        } catch {
            return null;
        }
    }

    // ── Ações do Git Flow ───────────────────────────────────

    async createBranch(type: string, cardNumber: string): Promise<CreateBranchResult> {
        const project = this._getProjectCode();
        const branchName = `${type}/${project}-${cardNumber}`;
        return this._doCreateBranch(branchName);
    }

    async createBranchFromJira(type: string, issueKey: string): Promise<CreateBranchResult> {
        const branchName = `${type}/${issueKey.toLowerCase()}`;
        return this._doCreateBranch(branchName);
    }

    private async _doCreateBranch(branchName: string): Promise<CreateBranchResult> {
        const steps: StepInfo[] = [];

        try {
            steps.push({ step: 'Atualizando main...', status: 'running' });
            await this._runGit('checkout main');
            await this._runGit('pull origin main');
            steps[0].status = 'done';

            steps.push({ step: `Criando branch ${branchName}...`, status: 'running' });
            await this._runGit(`checkout -b ${branchName}`);
            steps[1].status = 'done';

            steps.push({ step: 'Publicando no remoto...', status: 'running' });
            await this._runGit(`push origin ${branchName}`);
            steps[2].status = 'done';

            return { success: true, message: `Branch ${branchName} criada com sucesso!`, branchName, steps };
        } catch (error: any) {
            const lastRunning = steps.findIndex(s => s.status === 'running');
            if (lastRunning >= 0) { steps[lastRunning].status = 'error'; }
            return { success: false, message: `Erro ao criar branch: ${error.message}`, steps };
        }
    }

    async mergeToHml(): Promise<MergeResult> {
        try {
            const currentBranch = await this.getCurrentBranch();

            if (currentBranch === 'main' || currentBranch === 'hml') {
                return { success: false, message: `Você está na branch ${currentBranch}. Mude para a branch feat/bug que deseja mergear.` };
            }

            const status = await this.getStatus();
            if (status.hasChanges) {
                return { success: false, message: 'Há mudanças não commitadas. Faça commit ou stash antes de continuar.' };
            }

            await this._runGit('fetch origin');

            const alreadyMerged = await this._isMergedInto(currentBranch, 'hml');
            if (alreadyMerged) {
                return {
                    success: true, alreadyMerged: true, hasConflicts: false,
                    message: `A branch ${currentBranch} já está presente em hml.`,
                    suggestion: `Se ainda não abriu PR para main, siga o fluxo:\nPR no GitHub: ${currentBranch} → main`,
                };
            }

            const conflicts = await this._checkConflicts(currentBranch, 'hml');
            const project = this._getProjectCode();
            const cardMatch = currentBranch.match(new RegExp(`${project}-(\\d+)`, 'i'));
            const cardNum = cardMatch ? cardMatch[1] : 'xxxx';
            const mergeBranch = `merge/${project}-${cardNum}-hml`;

            if (!conflicts) {
                return {
                    success: true, hasConflicts: false,
                    message: `Sem conflitos detectados entre ${currentBranch} e hml.`,
                    suggestion: `Abra o Pull Request no GitHub:\nOrigem: ${currentBranch}\nDestino: hml\n\nUse "Create a merge commit" (não squash, não rebase).`,
                    currentBranch,
                };
            }

            await this._runGit(`pull origin ${currentBranch}`);
            await this._runGit('checkout hml');
            await this._runGit('pull origin hml');
            await this._runGit(`checkout -b ${mergeBranch}`);
            try { await this._runGit(`merge --no-commit --no-ff ${currentBranch}`); } catch { /* esperado com conflitos */ }

            return {
                success: true, hasConflicts: true,
                message: `Branch ${mergeBranch} criada com conflitos para resolver.`,
                suggestion: `Resolva os conflitos no VS Code (Source Control → Merge Editor).\n\nApós resolver todos os arquivos:\ngit add .\ngit commit -m "merge ${currentBranch} em hml"\ngit push origin ${mergeBranch}\n\nDepois abra PR no GitHub:\nOrigem: ${mergeBranch} → Destino: hml`,
                currentBranch, mergeBranch,
            };
        } catch (error: any) {
            return { success: false, message: `Erro: ${error.message}` };
        }
    }

    async mergeToMain(): Promise<MergeResult> {
        try {
            const currentBranch = await this.getCurrentBranch();

            if (currentBranch === 'main' || currentBranch === 'hml') {
                return { success: false, message: `Você está na branch ${currentBranch}. Mude para a branch feat/bug que deseja mergear.` };
            }

            const status = await this.getStatus();
            if (status.hasChanges) {
                return { success: false, message: 'Há mudanças não commitadas. Faça commit ou stash antes de continuar.' };
            }

            await this._runGit('fetch origin');

            const alreadyMerged = await this._isMergedInto(currentBranch, 'main');
            if (alreadyMerged) {
                return {
                    success: true, alreadyMerged: true, hasConflicts: false,
                    message: `A branch ${currentBranch} já está presente em main.`,
                };
            }

            const conflicts = await this._checkConflicts(currentBranch, 'main');
            const project = this._getProjectCode();
            const cardMatch = currentBranch.match(new RegExp(`${project}-(\\d+)`, 'i'));
            const cardNum = cardMatch ? cardMatch[1] : 'xxxx';
            const mergeBranch = `merge/${project}-${cardNum}-main`;

            if (!conflicts) {
                return {
                    success: true, hasConflicts: false,
                    message: `Sem conflitos detectados entre ${currentBranch} e main.`,
                    suggestion: `Abra o Pull Request no GitHub:\nOrigem: ${currentBranch}\nDestino: main\n\nUse "Create a merge commit" (não squash, não rebase).`,
                    currentBranch,
                };
            }

            await this._runGit('checkout main');
            await this._runGit('pull origin main');
            await this._runGit(`checkout -b ${mergeBranch}`);
            try { await this._runGit(`merge --no-commit --no-ff ${currentBranch}`); } catch { /* esperado com conflitos */ }

            return {
                success: true, hasConflicts: true,
                message: `Branch ${mergeBranch} criada com conflitos para resolver.`,
                suggestion: `Resolva os conflitos no VS Code (Source Control → Merge Editor).\n\nApós resolver todos os arquivos:\ngit add .\ngit commit -m "merge ${currentBranch} em main"\ngit push origin ${mergeBranch}\n\nDepois abra PR no GitHub:\nOrigem: ${mergeBranch} → Destino: main`,
                currentBranch, mergeBranch,
            };
        } catch (error: any) {
            return { success: false, message: `Erro: ${error.message}` };
        }
    }

}
