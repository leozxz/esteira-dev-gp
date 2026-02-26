import * as vscode from 'vscode';
import { type StageInfo } from '../data/stages';
import { GitService } from '../services/gitService';
import { getDeployHtml } from './templates/deployTemplate';
import { getDeployPrListHtml, type DeployPrListState } from './templates/deployPrListTemplate';
import { getDeployPrDetailHtml, type DeployPrDetailState } from './templates/deployPrDetailTemplate';

export class DeployPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private _stage: StageInfo | undefined;
    private _gitService: GitService | undefined;

    open(stage: StageInfo): void {
        this._stage = stage;

        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'esteira.deploy',
            'Esteira - Deploy',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true },
        );

        this._panel = panel;
        this._showMenu();

        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
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
                case 'backToMenu':
                    this._showMenu();
                    break;
            }
        });

        panel.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private _showMenu(): void {
        if (this._panel && this._stage) {
            this._panel.webview.html = getDeployHtml(this._stage);
        }
    }

    private _getGitService(): GitService {
        if (!this._gitService) {
            this._gitService = new GitService();
        }
        return this._gitService;
    }

    private _renderPrListView(): void {
        if (!this._panel) { return; }

        try {
            const git = this._getGitService();

            if (!git.isGhAuthenticated()) {
                const state: DeployPrListState = {
                    prs: [],
                    error: 'GitHub CLI não está autenticado. Execute "gh auth login" no terminal.',
                };
                this._panel.webview.html = getDeployPrListHtml(state);
                return;
            }

            const prs = git.ghListPrs();
            const state: DeployPrListState = { prs };
            this._panel.webview.html = getDeployPrListHtml(state);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const state: DeployPrListState = { prs: [], error: msg };
            this._panel.webview.html = getDeployPrListHtml(state);
        }
    }

    private _renderPrDetailView(prNumber: number): void {
        if (!this._panel) { return; }

        try {
            const git = this._getGitService();
            const pr = git.ghGetPrDetail(prNumber);
            const state: DeployPrDetailState = { pr };
            this._panel.webview.html = getDeployPrDetailHtml(state);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Create a minimal PR object for error display
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

    private _handleMergePr(prNumber: number, method: string): void {
        if (!this._panel) { return; }

        const validMethods = ['merge', 'squash', 'rebase'] as const;
        if (!validMethods.includes(method as typeof validMethods[number])) {
            this._renderPrDetailView(prNumber);
            return;
        }

        try {
            const git = this._getGitService();
            git.ghMergePr(prNumber, method as 'merge' | 'squash' | 'rebase');
            vscode.window.showInformationMessage(`PR #${prNumber} merged com sucesso!`);
            // Re-render detail to show updated state
            this._renderPrDetailView(prNumber);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Erro ao fazer merge: ${msg}`);
            this._renderPrDetailView(prNumber);
        }
    }
}
