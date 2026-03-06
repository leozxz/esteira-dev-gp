import * as vscode from 'vscode';
import { STAGES } from '../data/stages';
import { TerminalService } from '../services/terminalService';
import { ClaudeRunnerService } from '../services/claudeRunnerService';
import { ProdutoPanel } from './produtoPanel';
import { DesenvolvimentoPanel } from './desenvolvimentoPanel';
import { VersionamentoPanel } from './versionamentoPanel';
import { getSidebarHtml, JiraFilter, JiraSidebarState } from './templates/sidebarTemplate';
import { getStagePlaceholderHtml } from './templates/stagePlaceholderTemplate';
import { TokenManager } from '../jira/auth/tokenManager';
import { JiraAuthProvider } from '../jira/auth/jiraAuthProvider';
import { JiraClient } from '../jira/api/jiraClient';
import { IssueDetailPanel } from '../jira/views/issueDetailPanel';
import { CreateIssuePanel } from '../jira/views/createIssuePanel';
import { JiraIssue } from '../jira/models/types';

export class EsteiraSidebarProvider implements vscode.WebviewViewProvider {
    private readonly _produtoPanel: ProdutoPanel;
    private readonly _desenvolvimentoPanel: DesenvolvimentoPanel;
    private readonly _versionamentoPanel: VersionamentoPanel;

    private readonly _stageHandlers: Record<string, () => void>;

    // Jira services
    private readonly _tokenManager: TokenManager;
    private readonly _jiraAuth: JiraAuthProvider;
    private readonly _jiraClient: JiraClient;
    private _jiraState: JiraSidebarState = { loggedIn: false };
    private _jiraFilter: JiraFilter = 'mine';
    private _webviewView: vscode.WebviewView | undefined;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext,
        terminalService: TerminalService,
        claudeRunner: ClaudeRunnerService
    ) {
        this._produtoPanel = new ProdutoPanel(terminalService);
        this._desenvolvimentoPanel = new DesenvolvimentoPanel(claudeRunner);
        this._versionamentoPanel = new VersionamentoPanel();

        this._stageHandlers = {
            produto: () => {
                const stage = STAGES.find((s) => s.id === 'produto')!;
                this._produtoPanel.open(stage);
            },
            desenvolvimento: () => {
                const stage = STAGES.find((s) => s.id === 'desenvolvimento')!;
                this._desenvolvimentoPanel.open(stage);
            },
            versionamento: () => {
                const stage = STAGES.find((s) => s.id === 'versionamento')!;
                this._versionamentoPanel.open(stage);
            },
        };

        // Initialize Jira services
        this._tokenManager = new TokenManager(this._context.secrets);
        this._jiraAuth = new JiraAuthProvider(this._tokenManager);
        this._jiraClient = new JiraClient(this._jiraAuth, this._tokenManager);
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._webviewView = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = getSidebarHtml(STAGES, this._jiraState);

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'openStage':
                    this._openStagePanel(message.stageId);
                    break;
                case 'jiraLogin':
                    this._handleJiraLogin();
                    break;
                case 'jiraLogout':
                    this._handleJiraLogout();
                    break;
                case 'jiraRefresh':
                    this._loadJiraIssues();
                    break;
                case 'jiraOpenIssue':
                    this._handleJiraOpenIssue(message.issueKey);
                    break;
                case 'jiraCreateIssue':
                    this._handleJiraCreateIssue();
                    break;
                case 'jiraFilterChange':
                    this._jiraFilter = message.filter as JiraFilter;
                    this._loadJiraIssues();
                    break;
            }
        });

        // Check auth states on startup
        this._initJiraState();
    }

    // ── Jira ─────────────────────────────────────────────────

    private async _initJiraState(): Promise<void> {
        const loggedIn = await this._jiraAuth.isLoggedIn();
        if (loggedIn) {
            const tokens = await this._tokenManager.getTokens();
            this._jiraState = {
                loggedIn: true,
                userEmail: tokens?.userEmail,
                loading: true,
            };
            this._sendJiraState();
            await this._loadJiraIssues();
        }
    }

    private async _handleJiraLogin(): Promise<void> {
        try {
            this._jiraState = { loggedIn: false, loading: true };
            this._sendJiraState();

            const tokens = await this._jiraAuth.login();
            this._jiraState = {
                loggedIn: true,
                userEmail: tokens.userEmail,
                loading: true,
            };
            this._sendJiraState();
            await this._loadJiraIssues();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._jiraState = { loggedIn: false, error: msg };
            this._sendJiraState();
            vscode.window.showErrorMessage(`Jira login falhou: ${msg}`);
        }
    }

    private async _handleJiraLogout(): Promise<void> {
        await this._jiraAuth.logout();
        this._jiraState = { loggedIn: false };
        this._sendJiraState();
    }

    private async _loadJiraIssues(): Promise<void> {
        try {
            this._jiraState = {
                ...this._jiraState,
                loggedIn: true,
                loading: true,
                error: undefined,
                filter: this._jiraFilter,
            };
            this._sendJiraState();

            const trackedProjects = vscode.workspace
                .getConfiguration('jira')
                .get<string[]>('trackedProjects', []);

            let issues: JiraIssue[];
            if (this._jiraFilter === 'mine') {
                // Always filter by current user, regardless of trackedProjects
                issues = await this._jiraClient.getMyIssues(20, undefined);
            } else {
                // "all" — use tracked projects if configured
                issues = await this._jiraClient.getMyIssues(
                    20,
                    trackedProjects.length > 0 ? trackedProjects : undefined
                );
            }

            this._jiraState = {
                loggedIn: true,
                userEmail: this._jiraState.userEmail,
                filter: this._jiraFilter,
                issues: issues.map((i) => ({
                    key: i.key,
                    summary: i.fields.summary,
                    statusName: i.fields.status.name,
                    statusColor: this._getStatusColor(i.fields.status.statusCategory.key),
                    priorityName: i.fields.priority.name,
                    typeName: i.fields.issuetype.name,
                })),
            };
            this._sendJiraState();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._jiraState = {
                ...this._jiraState,
                loading: false,
                error: msg,
            };
            this._sendJiraState();
        }
    }

    private async _handleJiraOpenIssue(issueKey: string): Promise<void> {
        try {
            const issue: JiraIssue = await this._jiraClient.getIssue(issueKey);
            IssueDetailPanel.show(issue, this._extensionUri, this._jiraClient, () => {
                this._loadJiraIssues();
            });
        } catch (err) {
            vscode.window.showErrorMessage(
                `Erro ao abrir issue: ${err instanceof Error ? err.message : err}`
            );
        }
    }

    private async _handleJiraCreateIssue(): Promise<void> {
        try {
            await CreateIssuePanel.show(this._jiraClient, this._extensionUri, () => {
                this._loadJiraIssues();
            });
        } catch (err) {
            vscode.window.showErrorMessage(
                `Erro ao abrir formulário: ${err instanceof Error ? err.message : err}`
            );
        }
    }

    private _sendJiraState(): void {
        if (!this._webviewView) { return; }
        this._webviewView.webview.html = getSidebarHtml(STAGES, this._jiraState);
    }

    private _getStatusColor(categoryKey: string): string {
        switch (categoryKey) {
            case 'done': return '#36B37E';
            case 'indeterminate': return '#0065FF';
            case 'new': return '#6B778C';
            default: return '#6B778C';
        }
    }

    private _openStagePanel(stageId: string): void {
        const stage = STAGES.find((s) => s.id === stageId);
        if (!stage) {
            return;
        }

        const handler = this._stageHandlers[stageId];
        if (handler) {
            handler();
            return;
        }

        // QA and future stages use placeholder
        const panel = vscode.window.createWebviewPanel(
            `esteira.${stageId}`,
            `Esteira - ${stage.title}`,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getStagePlaceholderHtml(stage);
    }
}
