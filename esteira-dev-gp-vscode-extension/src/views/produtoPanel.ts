import * as vscode from 'vscode';
import { PRODUTO_STEPS } from '../data/produtoSteps';
import { type StageInfo } from '../data/stages';
import { TerminalService } from '../services/terminalService';
import { StepStateManager } from '../services/stepStateManager';
import { escapePathForShell } from '../utils/shellEscape';
import { getProdutoHtml } from './templates/produtoTemplate';

export class ProdutoPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private readonly _stateManager: StepStateManager;

    constructor(private readonly _terminalService: TerminalService) {
        this._stateManager = new StepStateManager(PRODUTO_STEPS.length);
    }

    open(stage: StageInfo): void {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'esteira.produto',
            'Esteira - Produto',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        this._panel = panel;
        panel.webview.html = getProdutoHtml(stage, PRODUTO_STEPS, PRODUTO_STEPS.length);

        this._stateManager.onStateChange((currentStep, completedSteps) => {
            panel.webview.postMessage({
                command: 'updateState',
                currentStep,
                completedSteps,
            });
        });

        panel.webview.onDidReceiveMessage((message) => {
            try {
                switch (message.command) {
                    case 'executeStep':
                        this._executeProdutoStep(message.stepNumber);
                        break;
                    case 'markStepComplete':
                        this._stateManager.completeStep(message.stepNumber);
                        break;
                    case 'openJiraDialog':
                        this._handleJiraStep();
                        break;
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Erro no painel Produto: ${msg}`);
            }
        });

        panel.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private _executeProdutoStep(stepNumber: number): void {
        const step = PRODUTO_STEPS.find((s) => s.id === stepNumber);
        if (!step) {
            return;
        }
        this._terminalService.sendCommand('Esteira - Produto', step.terminalCommand);
    }

    private async _handleJiraStep(): Promise<void> {
        try {
            const projectKey = await vscode.window.showInputBox({
                prompt: 'Digite a chave do projeto Jira (ex: PROJ, GROWTH, MYAPP)',
                placeHolder: 'PROJ',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'A chave do projeto é obrigatória';
                    }
                    if (!/^[A-Z][A-Z0-9_]+$/.test(value.trim())) {
                        return 'Use letras maiúsculas e números (ex: PROJ, MY_APP)';
                    }
                    return undefined;
                },
            });

            if (!projectKey) {
                return;
            }

            const escapedKey = escapePathForShell(projectKey.trim());
            this._terminalService.sendCommand(
                'Esteira - Produto',
                `claude "Leia docs/issues.md e crie as issues no Jira no projeto ${escapedKey}. Use a API do Jira via MCP. Crie primeiro os épicos, depois as tasks vinculadas e por fim as subtasks. Mantenha a hierarquia definida no arquivo."`
            );
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Erro ao criar issues no Jira: ${msg}`);
        }
    }
}
