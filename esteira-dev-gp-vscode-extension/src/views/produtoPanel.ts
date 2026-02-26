import * as vscode from 'vscode';
import { PRODUTO_STEPS, type ProdutoStep } from '../data/produtoSteps';
import { type StageInfo } from '../data/stages';
import { TerminalService } from '../services/terminalService';
import { escapePathForShell } from '../utils/shellEscape';
import { getProdutoHtml, type ProdutoPipelineState } from './templates/produtoTemplate';

export class ProdutoPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private _stage: StageInfo | undefined;
    private _pipelineState: ProdutoPipelineState = {
        steps: PRODUTO_STEPS,
        runningStepId: null,
        completedStepIds: [],
    };
    private _pipelineRunning = false;

    constructor(private readonly _terminalService: TerminalService) {}

    open(stage: StageInfo): void {
        this._stage = stage;

        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'esteira.produto',
            'Esteira - Produto',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true },
        );

        this._panel = panel;
        this._renderView();

        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'startPipeline':
                    this._runPipeline();
                    break;
                case 'resetPipeline':
                    this._resetPipeline();
                    break;
            }
        });

        panel.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private _renderView(): void {
        if (!this._panel || !this._stage) { return; }
        this._panel.webview.html = getProdutoHtml(
            this._stage,
            PRODUTO_STEPS,
            PRODUTO_STEPS.length,
            this._pipelineState,
        );
    }

    private _resetPipeline(): void {
        this._pipelineRunning = false;
        this._pipelineState = {
            steps: PRODUTO_STEPS,
            runningStepId: null,
            completedStepIds: [],
        };
        this._renderView();
    }

    private async _runPipeline(): Promise<void> {
        if (this._pipelineRunning) { return; }
        this._pipelineRunning = true;

        for (const step of PRODUTO_STEPS) {
            if (this._pipelineState.completedStepIds.includes(step.id)) {
                continue;
            }

            // ── Jira step: ask for project key first ──
            if (step.id === 5) {
                this._pipelineState.runningStepId = step.id;
                this._renderView();

                const executed = await this._handleJiraStep(step);
                if (!executed) {
                    // User cancelled — stop pipeline here
                    this._pipelineState.runningStepId = null;
                    this._pipelineState.error = 'Pipeline pausada: criação no Jira cancelada pelo usuário.';
                    this._pipelineRunning = false;
                    this._renderView();
                    return;
                }

                this._pipelineState.completedStepIds.push(step.id);
                this._pipelineState.runningStepId = null;
                this._renderView();
                continue;
            }

            // ── Regular step: execute and wait ──
            this._pipelineState.runningStepId = step.id;
            this._pipelineState.error = undefined;
            this._renderView();

            try {
                await this._executeStepAndWait(step);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this._pipelineState.error = `Erro no step "${step.title}": ${msg}`;
                this._pipelineState.runningStepId = null;
                this._pipelineRunning = false;
                this._renderView();
                return;
            }

            this._pipelineState.completedStepIds.push(step.id);
            this._pipelineState.runningStepId = null;
            this._renderView();
        }

        this._pipelineRunning = false;
        this._renderView();
        vscode.window.showInformationMessage('Pipeline de Produto concluída!');
    }

    private _executeStepAndWait(step: ProdutoStep): Promise<void> {
        return new Promise<void>((resolve) => {
            this._terminalService.sendCommand('Esteira - Produto', step.terminalCommand);

            // We can't detect terminal completion from VS Code API reliably.
            // Use a confirmation dialog to let the user signal when the step is done.
            const panel = vscode.window.createWebviewPanel(
                'esteira.produto.wait',
                `Aguardando: ${step.title}`,
                vscode.ViewColumn.Beside,
                { enableScripts: true },
            );

            panel.webview.html = this._getWaitingHtml(step);

            panel.webview.onDidReceiveMessage((msg) => {
                if (msg.command === 'stepDone') {
                    panel.dispose();
                    resolve();
                }
            });

            panel.onDidDispose(() => {
                resolve();
            });
        });
    }

    private async _handleJiraStep(step: ProdutoStep): Promise<boolean> {
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
            return false;
        }

        const escapedKey = escapePathForShell(projectKey.trim());
        const command = `claude "Leia docs/issues.md e crie as issues no Jira no projeto ${escapedKey}. Use a API do Jira via MCP. Crie primeiro os épicos, depois as tasks vinculadas e por fim as subtasks. Mantenha a hierarquia definida no arquivo."`;

        return new Promise<boolean>((resolve) => {
            this._terminalService.sendCommand('Esteira - Produto', command);

            const panel = vscode.window.createWebviewPanel(
                'esteira.produto.wait',
                `Aguardando: ${step.title}`,
                vscode.ViewColumn.Beside,
                { enableScripts: true },
            );

            panel.webview.html = this._getWaitingHtml(step);

            panel.webview.onDidReceiveMessage((msg) => {
                if (msg.command === 'stepDone') {
                    panel.dispose();
                    resolve(true);
                }
            });

            panel.onDidDispose(() => {
                resolve(true);
            });
        });
    }

    private _getWaitingHtml(step: ProdutoStep): string {
        const color = '#f59e0b';
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aguardando ${step.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 32px;
            text-align: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid color-mix(in srgb, ${color} 25%, transparent);
            border-top-color: ${color};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 24px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        p { font-size: 13px; color: var(--vscode-descriptionForeground); margin-bottom: 24px; line-height: 1.5; }
        .done-btn {
            padding: 10px 28px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            background: ${color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease;
        }
        .done-btn:hover { opacity: 0.85; }
    </style>
</head>
<body>
    <div class="spinner"></div>
    <h2>${step.title}</h2>
    <p>Acompanhe a execução no terminal.<br>Quando o step terminar, clique no botão abaixo para continuar a pipeline.</p>
    <button class="done-btn" id="doneBtn">Concluído — Próximo step</button>
    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('doneBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'stepDone' });
        });
    </script>
</body>
</html>`;
    }
}
