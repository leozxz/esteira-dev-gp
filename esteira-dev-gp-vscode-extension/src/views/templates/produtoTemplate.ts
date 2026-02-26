import { type StageInfo } from '../../data/stages';
import { type ProdutoStep } from '../../data/produtoSteps';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export function getProdutoHtml(stage: StageInfo, steps: ProdutoStep[], totalSteps: number): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const stepsHtml = steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const isJiraStep = step.id === 5;

        return `
            <div class="step" data-step="${step.id}" data-status="${isFirst ? 'active' : 'locked'}">
                <div class="step-indicator">
                    <div class="step-connector-top ${isFirst ? 'hidden' : ''}"></div>
                    <div class="step-number">
                        <span class="step-number-text">${step.id}</span>
                        <span class="step-check hidden">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                    </div>
                    <div class="step-connector-bottom ${isLast ? 'hidden' : ''}"></div>
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <div class="step-icon">${step.icon}</div>
                        <div class="step-info">
                            <h3>${step.title}</h3>
                            <p>${step.description}</p>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn-execute" data-step="${step.id}" ${isJiraStep ? 'data-jira="true"' : ''}>
                            ${step.buttonLabel}
                        </button>
                        <button class="btn-complete" data-step="${step.id}">
                            Marcar como concluído
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('\n');

    const styles = getBaseStyles(stage.color) + `
        .stepper {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .step {
            display: flex;
            gap: 16px;
            position: relative;
        }

        .step-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
            width: 36px;
        }

        .step-connector-top,
        .step-connector-bottom {
            width: 2px;
            flex: 1;
            min-height: 12px;
            background: var(--vscode-panel-border, var(--vscode-widget-border));
            transition: background 0.3s ease;
        }

        .step-connector-top.hidden,
        .step-connector-bottom.hidden {
            visibility: hidden;
        }

        .step-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            border: 2px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-editor-background);
            color: var(--vscode-descriptionForeground);
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .step-check {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .step-check svg {
            width: 18px;
            height: 18px;
        }

        .hidden {
            display: none;
        }

        .step[data-status="active"] .step-number {
            border-color: ${stage.color};
            background: color-mix(in srgb, ${stage.color} 15%, transparent);
            color: ${stage.color};
        }

        .step[data-status="completed"] .step-number {
            border-color: #10b981;
            background: #10b981;
            color: white;
        }

        .step[data-status="completed"] .step-number .step-number-text {
            display: none;
        }

        .step[data-status="completed"] .step-number .step-check {
            display: flex;
        }

        .step[data-status="completed"] .step-connector-top,
        .step[data-status="completed"] .step-connector-bottom {
            background: #10b981;
        }

        .step[data-status="active"] .step-connector-top {
            background: #10b981;
        }

        .step[data-status="locked"] .step-content {
            opacity: 0.5;
        }

        .step[data-status="locked"] .btn-execute,
        .step[data-status="locked"] .btn-complete {
            pointer-events: none;
            opacity: 0.4;
        }

        .step-content {
            flex: 1;
            padding-bottom: 24px;
            transition: opacity 0.3s ease;
        }

        .step-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
        }

        .step-icon {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: color-mix(in srgb, ${stage.color} 10%, transparent);
            padding: 6px;
        }

        .step-icon svg {
            width: 20px;
            height: 20px;
            stroke: ${stage.color};
        }

        .step-info h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .step-info p {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.5;
        }

        .step-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .btn-execute {
            padding: 6px 14px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${stage.color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease;
        }

        .btn-execute:hover {
            opacity: 0.85;
        }

        .btn-complete {
            padding: 6px 14px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            background: transparent;
            color: var(--vscode-foreground);
            font-family: inherit;
            transition: all 0.15s ease;
        }

        .btn-complete:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .step[data-status="completed"] .btn-execute {
            display: none;
        }

        .step[data-status="completed"] .btn-complete {
            border-color: #10b981;
            color: #10b981;
            pointer-events: none;
        }

        .step[data-status="completed"] .btn-complete::before {
            content: "\\2713  ";
        }

        .progress-bar {
            margin-bottom: 24px;
            padding: 12px 16px;
            border-radius: 8px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .progress-bar .progress-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }

        .progress-bar .progress-track {
            height: 4px;
            border-radius: 2px;
            background: var(--vscode-panel-border, var(--vscode-widget-border));
            overflow: hidden;
        }

        .progress-bar .progress-fill {
            height: 100%;
            border-radius: 2px;
            background: ${stage.color};
            transition: width 0.4s ease;
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

    <div class="progress-bar">
        <div class="progress-text"><span id="progressCount">0</span> de ${totalSteps} etapas concluídas</div>
        <div class="progress-track">
            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
    </div>

    <div class="stepper">
        ${stepsHtml}
    </div>`;

    const script = `
        const vscodeApi = acquireVsCodeApi();
        const totalSteps = ${totalSteps};

        let state = {
            currentStep: 1,
            completedSteps: []
        };

        function updateUI() {
            const steps = document.querySelectorAll('.step');
            steps.forEach(stepEl => {
                const stepNum = parseInt(stepEl.getAttribute('data-step'));
                if (state.completedSteps.includes(stepNum)) {
                    stepEl.setAttribute('data-status', 'completed');
                } else if (stepNum === state.currentStep) {
                    stepEl.setAttribute('data-status', 'active');
                } else if (stepNum < state.currentStep) {
                    stepEl.setAttribute('data-status', 'active');
                } else {
                    stepEl.setAttribute('data-status', 'locked');
                }
            });

            const completedCount = state.completedSteps.length;
            document.getElementById('progressCount').textContent = completedCount;
            document.getElementById('progressFill').style.width = (completedCount / totalSteps * 100) + '%';
        }

        document.querySelectorAll('.btn-execute').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepNum = parseInt(btn.getAttribute('data-step'));
                const isJira = btn.getAttribute('data-jira') === 'true';
                if (isJira) {
                    vscodeApi.postMessage({ command: 'openJiraDialog', stepNumber: stepNum });
                } else {
                    vscodeApi.postMessage({ command: 'executeStep', stepNumber: stepNum });
                }
            });
        });

        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepNum = parseInt(btn.getAttribute('data-step'));
                vscodeApi.postMessage({ command: 'markStepComplete', stepNumber: stepNum });
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateState') {
                state.currentStep = message.currentStep;
                state.completedSteps = message.completedSteps;
                updateUI();
            }
        });

        updateUI();
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Produto' });
}
