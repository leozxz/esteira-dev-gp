import * as vscode from 'vscode';
import { type StageInfo } from '../data/stages';
import { GitFlowService } from '../services/gitFlowService';
import { GitService } from '../services/gitService';
import { TokenManager } from '../jira/auth/tokenManager';
import { getVersionamentoHtml, type GhAuthState, type JiraCardInfo } from './templates/versionamentoTemplate';
import {
    getCreateBranchHtml,
    getCreatePrHtml,
    getMergeHmlHtml,
    getMergeMainHtml,
} from './templates/gitFlowTemplates';
import { getDeployPrListHtml, type DeployPrListState } from './templates/deployPrListTemplate';
import { getDeployPrDetailHtml, type DeployPrDetailState } from './templates/deployPrDetailTemplate';
import { JiraClient } from '../jira/api/jiraClient';

export class VersionamentoPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private _stage: StageInfo | undefined;
    private _gitFlowService: GitFlowService;
    private _gitService: GitService;
    private _jiraClient: JiraClient | undefined;

    constructor(private _tokenManager: TokenManager, jiraClient?: JiraClient) {
        this._gitFlowService = new GitFlowService();
        this._gitService = new GitService();
        this._jiraClient = jiraClient;
    }

    open(stage: StageInfo): void {
        this._stage = stage;

        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'esteira.versionamento',
            'Esteira - Versionamento',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true },
        );

        this._panel = panel;
        this._showMenu();

        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'backToMenu':
                    this._showMenu();
                    break;
                // ── GitHub auth ──
                case 'ghLogin':
                    this._handleGhLogin();
                    break;
                case 'ghLogout':
                    this._handleGhLogout();
                    break;
                // ── Git Flow ──
                case 'openCreateBranch':
                    this._handleOpenCreateBranch();
                    break;
                case 'executeCreateBranch':
                    this._handleExecuteCreateBranch(message.type, message.cardNumber);
                    break;
                case 'openMergeHml':
                    this._handleOpenMergeHml();
                    break;
                case 'executeMergeHml':
                    this._handleExecuteMergeHml();
                    break;
                case 'openMergeMain':
                    this._handleOpenMergeMain();
                    break;
                case 'executeMergeMain':
                    this._handleExecuteMergeMain();
                    break;
                // ── Create PR ──
                case 'openCreatePr':
                    this._handleOpenCreatePr();
                    break;
                case 'executeCreatePr':
                    this._handleExecuteCreatePr(message.base, message.title, message.body);
                    break;
                case 'previewDiff':
                    this._handlePreviewDiff(message.base);
                    break;
                // ── PR List & Detail ──
                case 'openPrList':
                    this._renderPrListView();
                    break;
                case 'refreshPrList':
                    this._renderPrListView();
                    break;
                case 'openPrDetail':
                    this._renderPrDetailView(message.prNumber);
                    break;
                case 'backToPrList':
                    this._renderPrListView();
                    break;
                case 'executeMerge':
                    this._handleMergePr(message.prNumber, message.method);
                    break;
                case 'openCreatePrFromMerge':
                    this._handleOpenCreatePr(message.base);
                    break;
                case 'openJiraCard':
                    if (message.url) {
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                    }
                    break;
                case 'openConflictUrl':
                    if (message.url) {
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                    }
                    break;
            }
        });

        panel.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private async _showMenu(): Promise<void> {
        if (this._panel && this._stage) {
            const ghAuth = await this._getGhAuthState();
            const jiraCard = await this._getJiraCardInfo();
            this._panel.webview.html = getVersionamentoHtml(this._stage, ghAuth, jiraCard);
        }
    }

    private async _getJiraCardInfo(): Promise<JiraCardInfo | undefined> {
        try {
            const currentBranch = this._gitService.getCurrentBranch();
            const match = currentBranch.match(/([a-zA-Z]+-\d+)/);
            if (!match) { return undefined; }

            const issueKey = match[1].toUpperCase();
            const tokens = await this._tokenManager.getTokens();
            const siteUrl = tokens?.siteUrl;
            if (!siteUrl) { return undefined; }

            const url = `${siteUrl}/browse/${issueKey}`;
            let summary: string | undefined;

            if (this._jiraClient) {
                try {
                    const issue = await this._jiraClient.getIssue(issueKey);
                    summary = issue.fields.summary;
                } catch { /* Jira not available */ }
            }

            return { key: issueKey, url, summary };
        } catch {
            return undefined;
        }
    }

    private async _getGhAuthState(): Promise<GhAuthState> {
        const loggedIn = await this._gitService.isGhAuthenticated();
        return { loggedIn, username: this._gitService.getGhUsername() };
    }

    private async _handleGhLogin(): Promise<void> {
        await this._gitService.ghLogin();
        this._showMenu();
    }

    private async _handleGhLogout(): Promise<void> {
        await this._gitService.ghLogout();
        this._showMenu();
    }

    // ── Git Flow Handlers ─────────────────────────────────────────

    private async _handleOpenCreateBranch(): Promise<void> {
        if (!this._panel) { return; }
        try {
            const currentBranch = await this._gitFlowService.getCurrentBranch();
            const config = vscode.workspace.getConfiguration('cportGitFlow');
            const projectCode = (config.get<string>('projectCode') || 'cport').toLowerCase();
            this._panel.webview.html = getCreateBranchHtml({ currentBranch, projectCode });
        } catch {
            const config = vscode.workspace.getConfiguration('cportGitFlow');
            const projectCode = (config.get<string>('projectCode') || 'cport').toLowerCase();
            this._panel.webview.html = getCreateBranchHtml({ currentBranch: 'unknown', projectCode });
        }
    }

    private async _handleExecuteCreateBranch(type: string, cardNumber: string): Promise<void> {
        if (!this._panel) { return; }
        const result = await this._gitFlowService.createBranch(type, cardNumber);
        this._panel.webview.postMessage({ command: 'createBranchResult', result });
    }

    private async _handleOpenMergeHml(): Promise<void> {
        if (!this._panel) { return; }
        try {
            const currentBranch = await this._gitFlowService.getCurrentBranch();
            this._panel.webview.html = getMergeHmlHtml({ currentBranch });
        } catch {
            this._panel.webview.html = getMergeHmlHtml({ currentBranch: 'unknown' });
        }
    }

    private async _handleExecuteMergeHml(): Promise<void> {
        if (!this._panel) { return; }
        const result = await this._gitFlowService.mergeToHml();
        this._panel.webview.postMessage({ command: 'mergeHmlResult', result });
    }

    private async _handleOpenMergeMain(): Promise<void> {
        if (!this._panel) { return; }
        try {
            const currentBranch = await this._gitFlowService.getCurrentBranch();
            this._panel.webview.html = getMergeMainHtml({ currentBranch });
        } catch {
            this._panel.webview.html = getMergeMainHtml({ currentBranch: 'unknown' });
        }
    }

    private async _handleExecuteMergeMain(): Promise<void> {
        if (!this._panel) { return; }
        const result = await this._gitFlowService.mergeToMain();
        this._panel.webview.postMessage({ command: 'mergeMainResult', result });
    }

    // ── Create PR Handlers ───────────────────────────────────────

    private async _handleOpenCreatePr(preselectedBase?: string): Promise<void> {
        if (!this._panel) { return; }
        try {
            const currentBranch = await this._gitFlowService.getCurrentBranch();
            const remoteBranches = this._gitService.getRemoteBranches()
                .map(b => b.replace(/^origin\//, ''))
                .filter(b => b !== 'HEAD' && b !== currentBranch);
            // Prioritize common base branches
            const priority = ['hml', 'main', 'master', 'develop'];
            const baseBranches = [
                ...priority.filter(b => remoteBranches.includes(b)),
                ...remoteBranches.filter(b => !priority.includes(b)),
            ];

            // Auto-fill: title = "branchName -> baseBranch"
            const defaultBase = preselectedBase || baseBranches[0] || 'main';
            const defaultTitle = `${currentBranch} -> ${defaultBase}`;

            // Auto-fill: description from Jira card title + link
            let defaultBody = '';
            const issueKeyMatch = currentBranch.match(/([a-zA-Z]+-\d+)/);
            if (issueKeyMatch) {
                const issueKey = issueKeyMatch[1].toUpperCase();
                const tokens = await this._tokenManager.getTokens();
                const siteUrl = tokens?.siteUrl;

                if (this._jiraClient) {
                    try {
                        const issue = await this._jiraClient.getIssue(issueKey);
                        defaultBody = issue.fields.summary;
                    } catch { /* Jira not available or issue not found */ }
                }

                if (siteUrl) {
                    const jiraLink = `${siteUrl}/browse/${issueKey}`;
                    defaultBody += `\n\n---\nJira: [${issueKey}](${jiraLink})`;
                }
            }

            this._panel.webview.html = getCreatePrHtml({
                currentBranch,
                baseBranches,
                defaultTitle,
                defaultBody,
                preselectedBase: preselectedBase,
            });
        } catch {
            this._panel.webview.html = getCreatePrHtml({ currentBranch: 'unknown', baseBranches: ['hml', 'main'] });
        }
    }

    private async _handlePreviewDiff(base: string): Promise<void> {
        if (!this._panel) { return; }
        try {
            const head = this._gitService.getCurrentBranch();
            const data = this._gitService.getDiffBetweenBranches(base, head);
            this._panel.webview.postMessage({ command: 'diffPreviewResult', success: true, data });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._panel.webview.postMessage({ command: 'diffPreviewResult', success: false, error: msg });
        }
    }

    private async _handleExecuteCreatePr(base: string, title: string, body: string): Promise<void> {
        if (!this._panel) { return; }
        try {
            const authenticated = await this._gitService.isGhAuthenticated();
            if (!authenticated) {
                this._panel.webview.postMessage({
                    command: 'createPrResult',
                    success: false,
                    error: 'GitHub não autenticado. Conecte-se primeiro.',
                });
                return;
            }

            // Append Jira card link to PR body if issue key detected in branch
            const finalBody = await this._appendJiraLink(body);

            const url = await this._gitService.ghCreatePr(base, title, finalBody);
            this._panel.webview.postMessage({ command: 'createPrResult', success: true, url });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._panel.webview.postMessage({ command: 'createPrResult', success: false, error: msg });
        }
    }

    private async _appendJiraLink(body: string): Promise<string> {
        try {
            const currentBranch = this._gitService.getCurrentBranch();
            // Match issue key pattern: PROJECT-123 (e.g., feat/cport-1622 → CPORT-1622)
            const match = currentBranch.match(/([a-zA-Z]+-\d+)/);
            if (!match) { return body; }

            const issueKey = match[1].toUpperCase();

            // Skip if the body already contains a Jira link for this issue
            if (body.includes(`/browse/${issueKey}`)) { return body; }

            const tokens = await this._tokenManager.getTokens();
            const siteUrl = tokens?.siteUrl;

            if (!siteUrl) { return body; }

            const jiraLink = `${siteUrl}/browse/${issueKey}`;
            const linkSection = `\n\n---\nJira: [${issueKey}](${jiraLink})`;

            return body ? body + linkSection : linkSection.trimStart();
        } catch {
            return body;
        }
    }

    // ── PR List & Detail Handlers ────────────────────────────────

    private async _renderPrListView(): Promise<void> {
        if (!this._panel) { return; }
        try {
            const authenticated = await this._gitService.isGhAuthenticated();
            if (!authenticated) {
                const state: DeployPrListState = {
                    prs: [],
                    error: 'GitHub não está autenticado. Conecte-se pelo botão no topo desta aba.',
                };
                this._panel.webview.html = getDeployPrListHtml(state);
                return;
            }
            const prs = await this._gitService.ghListPrs();
            const state: DeployPrListState = { prs };
            this._panel.webview.html = getDeployPrListHtml(state);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const state: DeployPrListState = { prs: [], error: msg };
            this._panel.webview.html = getDeployPrListHtml(state);
        }
    }

    private async _renderPrDetailView(prNumber: number): Promise<void> {
        if (!this._panel) { return; }
        try {
            const pr = await this._gitService.ghGetPrDetail(prNumber);
            const state: DeployPrDetailState = { pr };
            this._panel.webview.html = getDeployPrDetailHtml(state);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const state: DeployPrDetailState = {
                pr: {
                    number: prNumber,
                    title: `PR #${prNumber}`,
                    body: '',
                    author: '',
                    baseRefName: '',
                    headRefName: '',
                    isDraft: false,
                    state: 'OPEN',
                    labels: [],
                    reviewDecision: '',
                    url: '',
                    mergeable: 'UNKNOWN',
                    statusCheckRollup: [],
                    comments: [],
                    reviews: [],
                },
                error: msg,
            };
            this._panel.webview.html = getDeployPrDetailHtml(state);
        }
    }

    private async _handleMergePr(prNumber: number, method: string): Promise<void> {
        if (!this._panel) { return; }
        const validMethods = ['merge', 'squash', 'rebase'] as const;
        if (!validMethods.includes(method as typeof validMethods[number])) {
            this._renderPrDetailView(prNumber);
            return;
        }
        try {
            await this._gitService.ghMergePr(prNumber, method as 'merge' | 'squash' | 'rebase');
            vscode.window.showInformationMessage(`PR #${prNumber} merged com sucesso!`);
            await this._renderPrDetailView(prNumber);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Erro ao fazer merge: ${msg}`);
            this._renderPrDetailView(prNumber);
        }
    }

}
