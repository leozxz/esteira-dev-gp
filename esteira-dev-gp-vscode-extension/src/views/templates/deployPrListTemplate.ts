import { type GhPrListItem } from '../../services/gitService';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface DeployPrListState {
    prs: GhPrListItem[];
    error?: string;
}

const ACCENT = '#8b5cf6';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getStateBadge(pr: GhPrListItem): string {
    if (pr.isDraft) {
        return `<span class="pr-badge pr-badge-draft">Draft</span>`;
    }
    switch (pr.state) {
        case 'OPEN':   return `<span class="pr-badge pr-badge-open">Aberto</span>`;
        case 'MERGED': return `<span class="pr-badge pr-badge-merged">Merged</span>`;
        case 'CLOSED': return `<span class="pr-badge pr-badge-closed">Fechado</span>`;
        default:       return `<span class="pr-badge">${escapeHtml(pr.state)}</span>`;
    }
}

function getReviewBadge(decision: string): string {
    switch (decision) {
        case 'APPROVED':          return `<span class="pr-badge pr-badge-approved">Aprovado</span>`;
        case 'CHANGES_REQUESTED': return `<span class="pr-badge pr-badge-changes">Alterações</span>`;
        case 'REVIEW_REQUIRED':   return `<span class="pr-badge pr-badge-pending">Pendente</span>`;
        default:                  return `<span class="pr-badge pr-badge-pending">Pendente</span>`;
    }
}

export function getDeployPrListHtml(state: DeployPrListState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    let contentHtml: string;

    if (state.error) {
        contentHtml = `<div class="pr-error">${escapeHtml(state.error)}</div>`;
    } else if (state.prs.length === 0) {
        contentHtml = `<div class="pr-empty">Nenhum Pull Request aberto encontrado.</div>`;
    } else {
        contentHtml = state.prs.map(pr => {
            const labelsHtml = pr.labels.map(l =>
                `<span class="pr-label">${escapeHtml(l)}</span>`
            ).join('');

            return `
            <div class="pr-row" data-pr="${pr.number}">
                <div class="pr-row-left">
                    <span class="pr-number">#${pr.number}</span>
                    <div class="pr-info">
                        <span class="pr-title">${escapeHtml(pr.title)}</span>
                        <span class="pr-meta">@${escapeHtml(pr.author)} · ${escapeHtml(pr.headRefName)} → ${escapeHtml(pr.baseRefName)}</span>
                    </div>
                </div>
                <div class="pr-row-right">
                    ${labelsHtml}
                    ${getStateBadge(pr)}
                    ${getReviewBadge(pr.reviewDecision)}
                </div>
            </div>`;
        }).join('\n');
    }

    const styles = getBaseStyles(ACCENT) + `
        .pr-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .pr-back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: ${ACCENT};
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            border: none;
            background: none;
            font-family: inherit;
        }

        .pr-back-link:hover { text-decoration: underline; }

        .pr-back-link svg {
            width: 14px;
            height: 14px;
            stroke: ${ACCENT};
        }

        .pr-refresh-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            color: var(--vscode-foreground);
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
        }

        .pr-refresh-btn:hover {
            border-color: ${ACCENT};
        }

        .pr-refresh-btn svg {
            width: 14px;
            height: 14px;
        }

        .pr-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 8px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: border-color 0.15s ease;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
        }

        .pr-row:hover {
            border-color: ${ACCENT};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${ACCENT} 30%, transparent);
        }

        .pr-row-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .pr-number {
            font-weight: 700;
            font-size: 14px;
            color: ${ACCENT};
            flex-shrink: 0;
        }

        .pr-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .pr-title {
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pr-meta {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .pr-row-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            margin-left: 12px;
        }

        .pr-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        .pr-badge-open { background: #22863a22; color: #22863a; }
        .pr-badge-merged { background: #6f42c122; color: #8b5cf6; }
        .pr-badge-closed { background: #cb243622; color: #cb2436; }
        .pr-badge-draft { background: #6a737d22; color: #6a737d; }
        .pr-badge-approved { background: #22863a22; color: #22863a; }
        .pr-badge-changes { background: #e3600022; color: #e36000; }
        .pr-badge-pending { background: #dbab0922; color: #dbab09; }

        .pr-label {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 500;
            background: var(--vscode-badge-background, rgba(255,255,255,0.08));
            color: var(--vscode-badge-foreground, var(--vscode-descriptionForeground));
        }

        .pr-error {
            padding: 16px;
            border-radius: 8px;
            background: #cb243615;
            color: #cb2436;
            font-size: 13px;
        }

        .pr-empty {
            padding: 32px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
        }

        .pr-section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
        }
    `;

    const body = `
    <div class="pr-toolbar">
        <button class="pr-back-link" id="backBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar ao menu
        </button>
        <button class="pr-refresh-btn" id="refreshBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Atualizar
        </button>
    </div>

    <h2 class="pr-section-title">Pull Requests</h2>

    ${contentHtml}`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refreshPrList' });
        });

        document.querySelectorAll('.pr-row').forEach(row => {
            row.addEventListener('click', () => {
                const prNumber = parseInt(row.getAttribute('data-pr'), 10);
                vscode.postMessage({ command: 'openPrDetail', prNumber });
            });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Pull Requests' });
}
