import { type StageInfo } from '../../data/stages';
import { type ProdutoStep } from '../../data/produtoSteps';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface ProdutoPipelineState {
    steps: ProdutoStep[];
    runningStepId: number | null;
    completedStepIds: number[];
    error?: string;
    jiraPrompt?: boolean;          // true = waiting for Jira project key
}

function getStatusClass(step: ProdutoStep, state: ProdutoPipelineState): string {
    if (state.completedStepIds.includes(step.id)) { return 'card-completed'; }
    if (state.runningStepId === step.id) { return 'card-running'; }
    return '';
}

function getStatusBadge(step: ProdutoStep, state: ProdutoPipelineState): string {
    if (state.completedStepIds.includes(step.id)) {
        return `<span class="card-badge card-badge-done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Concluído</span>`;
    }
    if (state.runningStepId === step.id) {
        return `<span class="card-badge card-badge-running"><span class="spinner"></span> Executando…</span>`;
    }
    return `<span class="card-badge card-badge-pending">Pendente</span>`;
}

export function getProdutoHtml(stage: StageInfo, _steps: ProdutoStep[], _totalSteps: number, pipelineState?: ProdutoPipelineState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const state: ProdutoPipelineState = pipelineState ?? {
        steps: _steps,
        runningStepId: null,
        completedStepIds: [],
    };
    const steps = state.steps.length > 0 ? state.steps : _steps;

    const completedCount = state.completedStepIds.length;
    const totalSteps = steps.length;
    const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    const errorHtml = state.error
        ? `<div class="pipeline-error">${state.error.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
        : '';

    const cardsHtml = steps.map(step => `
            <div class="dev-card ${getStatusClass(step, state)}" data-card="${step.id}">
                <div class="dev-card-icon">${step.icon}</div>
                <div class="dev-card-body">
                    <h3>${step.title}</h3>
                    <p class="dev-card-desc">${step.description}</p>
                    <div class="dev-card-features">
                        ${getStatusBadge(step, state)}
                    </div>
                </div>
            </div>
        `).join('\n');

    const allDone = completedCount === totalSteps;
    const isRunning = state.runningStepId !== null;

    const styles = getBaseStyles(stage.color) + `
        .pipeline-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .pipeline-start-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            background: ${stage.color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
        }

        .pipeline-start-btn:hover { opacity: 0.85; }
        .pipeline-start-btn:active { transform: scale(0.97); }

        .pipeline-start-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .pipeline-start-btn:disabled:hover { opacity: 0.4; }
        .pipeline-start-btn:disabled:active { transform: none; }

        .pipeline-start-btn svg {
            width: 16px;
            height: 16px;
        }

        .pipeline-reset-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            background: transparent;
            color: var(--vscode-foreground);
            font-family: inherit;
            transition: border-color 0.15s ease, background 0.15s ease;
        }

        .pipeline-reset-btn:hover {
            border-color: ${stage.color};
            background: var(--vscode-list-hoverBackground);
        }

        .pipeline-reset-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .pipeline-reset-btn svg {
            width: 14px;
            height: 14px;
        }

        .progress-bar {
            margin-bottom: 24px;
            padding: 12px 16px;
            border-radius: 8px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .progress-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }

        .progress-track {
            height: 4px;
            border-radius: 2px;
            background: var(--vscode-panel-border, var(--vscode-widget-border));
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            border-radius: 2px;
            background: ${stage.color};
            transition: width 0.4s ease;
        }

        .dev-cards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }

        .dev-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 28px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.3s ease, opacity 0.3s ease;
        }

        .dev-card-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: color-mix(in srgb, ${stage.color} 12%, transparent);
            padding: 10px;
            margin-bottom: 16px;
        }

        .dev-card-icon svg {
            width: 28px;
            height: 28px;
            stroke: ${stage.color};
        }

        .dev-card-body h3 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 6px;
        }

        .dev-card-desc {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.5;
            margin-bottom: 14px;
        }

        .dev-card-features {
            display: flex;
            gap: 6px;
            margin-top: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }

        /* Status card styles */
        .card-completed {
            border-color: #10b981;
        }

        .card-completed .dev-card-icon {
            background: color-mix(in srgb, #10b981 12%, transparent);
        }

        .card-completed .dev-card-icon svg {
            stroke: #10b981;
        }

        .card-running {
            border-color: ${stage.color};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${stage.color} 30%, transparent);
        }

        /* Badges */
        .card-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        .card-badge svg {
            width: 12px;
            height: 12px;
        }

        .card-badge-done {
            background: #10b98122;
            color: #10b981;
        }

        .card-badge-running {
            background: color-mix(in srgb, ${stage.color} 15%, transparent);
            color: ${stage.color};
        }

        .card-badge-pending {
            background: var(--vscode-badge-background, rgba(255,255,255,0.08));
            color: var(--vscode-badge-foreground, var(--vscode-descriptionForeground));
        }

        .spinner {
            width: 10px;
            height: 10px;
            border: 2px solid color-mix(in srgb, ${stage.color} 30%, transparent);
            border-top-color: ${stage.color};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .pipeline-error {
            padding: 12px 16px;
            border-radius: 8px;
            background: #cb243615;
            color: #cb2436;
            font-size: 12px;
            margin-bottom: 16px;
        }

        .pipeline-done-msg {
            text-align: center;
            padding: 16px;
            font-size: 14px;
            font-weight: 600;
            color: #10b981;
        }
    `;

    const body = `
    <div class="stage-header">
        <div class="stage-icon">${stage.icon}</div>
        <div class="stage-title">
            <h1>${stage.title}</h1>
            <p>${stage.description}</p>
        </div>
    </div>

    <div class="pipeline-toolbar">
        <button class="pipeline-start-btn" id="startPipelineBtn" ${isRunning || allDone ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${allDone ? 'Pipeline concluída' : isRunning ? 'Executando…' : 'Iniciar Pipeline'}
        </button>
        ${completedCount > 0 ? `<button class="pipeline-reset-btn" id="resetPipelineBtn" ${isRunning ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Resetar Pipeline
        </button>` : ''}
    </div>

    <div class="progress-bar">
        <div class="progress-text"><span id="progressCount">${completedCount}</span> de ${totalSteps} etapas concluídas</div>
        <div class="progress-track">
            <div class="progress-fill" id="progressFill" style="width: ${progressPct}%"></div>
        </div>
    </div>

    ${errorHtml}

    <div class="dev-cards-grid">
        ${cardsHtml}
    </div>

    ${allDone ? '<div class="pipeline-done-msg">Pipeline de Produto concluída com sucesso!</div>' : ''}`;

    const script = `
        const vscodeApi = acquireVsCodeApi();

        document.getElementById('startPipelineBtn').addEventListener('click', () => {
            vscodeApi.postMessage({ command: 'startPipeline' });
        });

        const resetBtn = document.getElementById('resetPipelineBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                vscodeApi.postMessage({ command: 'resetPipeline' });
            });
        }

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'pipelineUpdate') {
                // Full re-render is handled by the panel, no incremental update needed
            }
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Produto' });
}
