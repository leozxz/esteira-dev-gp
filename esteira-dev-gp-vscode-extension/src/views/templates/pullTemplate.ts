import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface PullViewState {
    remoteBranches: string[];
    currentBranch: string;
    error?: string;
}

const ACCENT_COLOR = '#3b82f6';

const PULL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function getPullHtml(state: PullViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const branchOptions = state.remoteBranches
        .map(b => {
            const shortName = b.replace(/^origin\//, '');
            return `<option value="${escapeHtml(shortName)}" ${shortName === state.currentBranch ? 'selected' : ''}>${escapeHtml(b)}</option>`;
        })
        .join('');

    const errorHtml = state.error
        ? `<div class="error-banner">${escapeHtml(state.error)}</div>`
        : '';

    const styles = getBaseStyles(ACCENT_COLOR) + `
        .pull-container { max-width: 720px; margin: 0 auto; }

        .meta-card {
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 16px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.15s ease;
        }
        .meta-card:hover {
            border-color: color-mix(in srgb, ${ACCENT_COLOR} 50%, transparent);
        }

        .card-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: ${ACCENT_COLOR};
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card-title svg {
            width: 14px; height: 14px; stroke: ${ACCENT_COLOR};
        }

        .branch-current {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .branch-current-name {
            font-weight: 600;
            color: ${ACCENT_COLOR};
            font-family: var(--vscode-editor-font-family, monospace);
        }

        .pull-row {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }

        .branch-select {
            flex: 1;
            min-width: 160px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: inherit;
            font-size: 13px;
        }
        .branch-select:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }

        .btn-execute {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            background: ${ACCENT_COLOR};
            color: #fff;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }
        .btn-execute:hover { opacity: 0.85; }
        .btn-execute:active { transform: scale(0.97); }
        .btn-execute:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            margin-bottom: 20px;
            border: none;
            background: none;
            font-family: inherit;
            padding: 4px 0;
        }
        .back-link:hover { color: var(--vscode-foreground); }
        .back-link svg { width: 14px; height: 14px; }

        .error-banner {
            background: color-mix(in srgb, #ef4444 12%, transparent);
            border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #ef4444;
        }

        .empty-msg {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            padding: 8px 0;
            font-style: italic;
        }
    `;

    const noBranches = state.remoteBranches.length === 0;

    const body = `
    <button class="back-link" id="backBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar ao menu
    </button>

    <div class="stage-header">
        <div class="stage-icon">${PULL_ICON}</div>
        <div class="stage-title">
            <h1>Pull</h1>
            <p>Atualize seu repositório local com as alterações remotas</p>
        </div>
    </div>

    ${errorHtml}

    <div class="pull-container">
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                Branch Remota
            </div>
            <div class="branch-current">
                Branch atual: <span class="branch-current-name">${escapeHtml(state.currentBranch)}</span>
            </div>
            ${noBranches
                ? `<div class="empty-msg">Nenhuma branch remota encontrada. Verifique se existe um remote configurado.</div>`
                : `<div class="pull-row">
                    <select class="branch-select" id="branchSelect">
                        ${branchOptions}
                    </select>
                    <button class="btn-execute" id="pullBtn">Pull</button>
                </div>`
            }
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        const pullBtn = document.getElementById('pullBtn');
        if (pullBtn) {
            pullBtn.addEventListener('click', () => {
                const branch = document.getElementById('branchSelect').value;
                pullBtn.disabled = true;
                pullBtn.textContent = 'Pulling...';
                vscode.postMessage({ command: 'executePull', branch });
            });
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Pull' });
}
