import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface PrViewState {
    currentBranch: string;
    branches: string[];
    remoteBranches: string[];
    remoteUrl: string | null;
    error?: string;
}

const ACCENT_COLOR = '#3b82f6';

const PR_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`;

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function getPrHtml(state: PrViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const errorHtml = state.error
        ? `<div class="error-banner">${escapeHtml(state.error)}</div>`
        : '';

    // Combine local and remote branches for base selection, prefer common ones first
    const baseCandidates = new Set<string>();
    for (const b of state.remoteBranches) {
        baseCandidates.add(b.replace(/^origin\//, ''));
    }
    for (const b of state.branches) {
        baseCandidates.add(b);
    }
    // Remove current branch from base options
    baseCandidates.delete(state.currentBranch);

    // Sort with main/master/develop first
    const priority = ['main', 'master', 'develop', 'development'];
    const sorted = [...baseCandidates].sort((a, b) => {
        const ai = priority.indexOf(a);
        const bi = priority.indexOf(b);
        if (ai !== -1 && bi !== -1) { return ai - bi; }
        if (ai !== -1) { return -1; }
        if (bi !== -1) { return 1; }
        return a.localeCompare(b);
    });

    const baseOptions = sorted
        .map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`)
        .join('');

    const styles = getBaseStyles(ACCENT_COLOR) + `
        .pr-container { max-width: 720px; margin: 0 auto; }

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

        .form-group {
            margin-bottom: 14px;
        }
        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: var(--vscode-foreground);
            margin-bottom: 6px;
        }

        .branch-select, .pr-input {
            width: 100%;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: inherit;
            font-size: 13px;
            box-sizing: border-box;
        }
        .branch-select:focus, .pr-input:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }

        .pr-textarea {
            width: 100%;
            min-height: 120px;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            resize: vertical;
            line-height: 1.5;
            box-sizing: border-box;
        }
        .pr-textarea:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }
        .pr-textarea::placeholder {
            color: var(--vscode-descriptionForeground);
            opacity: 0.6;
        }

        .pr-actions {
            display: flex;
            gap: 8px;
            margin-top: 14px;
            justify-content: flex-end;
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

        .no-remote-msg {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            padding: 8px 0;
            font-style: italic;
        }
    `;

    const hasRemote = !!state.remoteUrl;
    const hasBranches = sorted.length > 0;

    const body = `
    <button class="back-link" id="backBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar ao menu
    </button>

    <div class="stage-header">
        <div class="stage-icon">${PR_ICON}</div>
        <div class="stage-title">
            <h1>Pull Request</h1>
            <p>Crie um Pull Request para revisão de código</p>
        </div>
    </div>

    ${errorHtml}

    <div class="pr-container">
        <div class="meta-card">
            <div class="card-title">
                ${PR_ICON}
                Criar Pull Request
            </div>
            <div class="branch-current">
                Branch atual (head): <span class="branch-current-name">${escapeHtml(state.currentBranch)}</span>
            </div>

            ${!hasRemote
                ? `<div class="no-remote-msg">Nenhum remote configurado. Configure um remote na tela de Commit primeiro.</div>`
                : !hasBranches
                    ? `<div class="no-remote-msg">Nenhuma branch disponível como base.</div>`
                    : `
            <div class="form-group">
                <label class="form-label">Branch Base</label>
                <select class="branch-select" id="baseBranch">
                    ${baseOptions}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="pr-input" id="prTitle" placeholder="Título do Pull Request..." />
            </div>

            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="pr-textarea" id="prBody" placeholder="Descreva as alterações do PR..."></textarea>
            </div>

            <div class="pr-actions">
                <button class="btn-execute" id="createPrBtn">Criar Pull Request</button>
            </div>`
            }
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        const createPrBtn = document.getElementById('createPrBtn');
        if (createPrBtn) {
            createPrBtn.addEventListener('click', () => {
                const base = document.getElementById('baseBranch').value;
                const title = document.getElementById('prTitle').value.trim();
                const body = document.getElementById('prBody').value.trim();

                if (!title) {
                    return;
                }

                createPrBtn.disabled = true;
                createPrBtn.textContent = 'Criando PR...';
                vscode.postMessage({ command: 'executePr', base, title, body });
            });
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Pull Request' });
}
