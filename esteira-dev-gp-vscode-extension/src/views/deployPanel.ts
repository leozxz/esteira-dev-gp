import * as vscode from 'vscode';
import { type StageInfo } from '../data/stages';
import { getDeployHtml } from './templates/deployTemplate';

export class DeployPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private _stage: StageInfo | undefined;

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
}
