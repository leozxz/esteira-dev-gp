import { type GhPrDetail } from '../../services/gitService';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface DeployPrDetailState {
    pr: GhPrDetail;
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

function formatDate(isoDate: string): string {
    if (!isoDate) { return ''; }
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoDate;
    }
}

function getCheckIcon(conclusion: string): string {
    switch (conclusion.toUpperCase()) {
        case 'SUCCESS':
        case 'NEUTRAL':
            return `<svg class="check-icon check-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`;
        case 'FAILURE':
        case 'TIMED_OUT':
        case 'CANCELLED':
            return `<svg class="check-icon check-failure" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        default:
            return `<svg class="check-icon check-pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    }
}

function getReviewStateBadge(state: string): string {
    switch (state) {
        case 'APPROVED':
            return `<span class="review-state review-approved">Aprovado</span>`;
        case 'CHANGES_REQUESTED':
            return `<span class="review-state review-changes">Alterações Solicitadas</span>`;
        case 'COMMENTED':
            return `<span class="review-state review-commented">Comentou</span>`;
        case 'DISMISSED':
            return `<span class="review-state review-dismissed">Dispensado</span>`;
        default:
            return `<span class="review-state review-pending">Pendente</span>`;
    }
}

export function getDeployPrDetailHtml(state: DeployPrDetailState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);
    const pr = state.pr;

    // ── Header ──────────────────────────────────────────
    const stateBadge = pr.isDraft
        ? `<span class="pr-badge pr-badge-draft">Draft</span>`
        : pr.state === 'OPEN'
            ? `<span class="pr-badge pr-badge-open">Aberto</span>`
            : pr.state === 'MERGED'
                ? `<span class="pr-badge pr-badge-merged">Merged</span>`
                : `<span class="pr-badge pr-badge-closed">Fechado</span>`;

    const labelsHtml = pr.labels.map(l =>
        `<span class="pr-label">${escapeHtml(l)}</span>`
    ).join(' ');

    const headerHtml = `
    <div class="meta-card">
        <div class="pr-detail-header">
            <h2>${escapeHtml(pr.title)} <span class="pr-number-detail">#${pr.number}</span></h2>
            <div class="pr-detail-meta">
                <span>${escapeHtml(pr.headRefName)} → ${escapeHtml(pr.baseRefName)}</span>
                <span>@${escapeHtml(pr.author)}</span>
                ${stateBadge}
                ${labelsHtml}
            </div>
        </div>
    </div>`;

    // ── Description ─────────────────────────────────────
    const bodyHtml = pr.body.trim()
        ? `<div class="meta-card">
            <h3 class="meta-card-title">Descrição</h3>
            <div class="pr-body">${escapeHtml(pr.body).replace(/\n/g, '<br>')}</div>
        </div>`
        : '';

    // ── Status Checks ───────────────────────────────────
    let checksHtml = '';
    if (pr.statusCheckRollup.length > 0) {
        const checksList = pr.statusCheckRollup.map(c =>
            `<div class="check-row">
                ${getCheckIcon(c.conclusion)}
                <span class="check-name">${escapeHtml(c.name)}</span>
            </div>`
        ).join('\n');

        checksHtml = `
        <div class="meta-card">
            <h3 class="meta-card-title">Status Checks</h3>
            ${checksList}
        </div>`;
    }

    // ── Reviews & Comments timeline ─────────────────────
    type TimelineEntry = { author: string; body: string; createdAt: string; type: 'review' | 'comment'; state?: string };

    const timeline: TimelineEntry[] = [];
    for (const r of pr.reviews) {
        timeline.push({ author: r.author, body: r.body, createdAt: r.createdAt, type: 'review', state: r.state });
    }
    for (const c of pr.comments) {
        timeline.push({ author: c.author, body: c.body, createdAt: c.createdAt, type: 'comment' });
    }
    timeline.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    let timelineHtml = '';
    if (timeline.length > 0) {
        const entriesHtml = timeline.map(entry => {
            const badge = entry.type === 'review' && entry.state
                ? getReviewStateBadge(entry.state)
                : `<span class="review-state review-commented">Comentou</span>`;

            const bodyContent = entry.body.trim()
                ? `<div class="timeline-body">${escapeHtml(entry.body).replace(/\n/g, '<br>')}</div>`
                : '';

            return `
            <div class="timeline-entry">
                <div class="timeline-header">
                    <span class="timeline-author">@${escapeHtml(entry.author)}</span>
                    ${badge}
                    <span class="timeline-date">${formatDate(entry.createdAt)}</span>
                </div>
                ${bodyContent}
            </div>`;
        }).join('\n');

        timelineHtml = `
        <div class="meta-card">
            <h3 class="meta-card-title">Reviews e Comentários (${timeline.length})</h3>
            <div class="timeline">${entriesHtml}</div>
        </div>`;
    }

    // ── Merge section ───────────────────────────────────
    const canMerge = pr.mergeable === 'MERGEABLE' && pr.state === 'OPEN' && !pr.isDraft;
    const mergeDisabledAttr = canMerge ? '' : 'disabled';
    const mergeDisabledClass = canMerge ? '' : 'merge-btn-disabled';

    let mergeHint = '';
    if (pr.state !== 'OPEN') {
        mergeHint = `<p class="merge-hint">Este PR não está aberto.</p>`;
    } else if (pr.isDraft) {
        mergeHint = `<p class="merge-hint">Este PR é um draft. Marque como pronto antes de fazer merge.</p>`;
    } else if (pr.mergeable === 'CONFLICTING') {
        mergeHint = `<p class="merge-hint">Existem conflitos que precisam ser resolvidos antes do merge.</p>`;
    } else if (pr.mergeable === 'UNKNOWN') {
        mergeHint = `<p class="merge-hint">O status de merge ainda está sendo calculado.</p>`;
    }

    const mergeHtml = `
    <div class="meta-card">
        <h3 class="meta-card-title">Merge</h3>
        ${mergeHint}
        <div class="merge-controls">
            <select id="mergeMethod" class="merge-select">
                <option value="squash">Squash and merge</option>
                <option value="merge">Create a merge commit</option>
                <option value="rebase">Rebase and merge</option>
            </select>
            <button id="mergeBtn" class="merge-btn ${mergeDisabledClass}" ${mergeDisabledAttr}>
                Merge PR #${pr.number}
            </button>
        </div>
    </div>`;

    // ── Error ───────────────────────────────────────────
    const errorHtml = state.error
        ? `<div class="pr-error">${escapeHtml(state.error)}</div>`
        : '';

    const styles = getBaseStyles(ACCENT) + `
        .pr-toolbar {
            display: flex;
            align-items: center;
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

        .meta-card {
            padding: 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 8px;
            margin-bottom: 16px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
        }

        .meta-card-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }

        .pr-detail-header h2 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .pr-number-detail {
            color: var(--vscode-descriptionForeground);
            font-weight: 400;
        }

        .pr-detail-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .pr-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
        }

        .pr-badge-open { background: #22863a22; color: #22863a; }
        .pr-badge-merged { background: #6f42c122; color: #8b5cf6; }
        .pr-badge-closed { background: #cb243622; color: #cb2436; }
        .pr-badge-draft { background: #6a737d22; color: #6a737d; }

        .pr-label {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 500;
            background: var(--vscode-badge-background, rgba(255,255,255,0.08));
            color: var(--vscode-badge-foreground, var(--vscode-descriptionForeground));
        }

        .pr-body {
            font-size: 13px;
            line-height: 1.6;
            color: var(--vscode-foreground);
        }

        /* Status Checks */
        .check-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 0;
        }

        .check-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        .check-success { stroke: #22863a; }
        .check-failure { stroke: #cb2436; }
        .check-pending { stroke: #dbab09; }

        .check-name {
            font-size: 13px;
        }

        /* Timeline */
        .timeline {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .timeline-entry {
            padding: 12px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
        }

        .timeline-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            flex-wrap: wrap;
        }

        .timeline-author {
            font-size: 12px;
            font-weight: 600;
        }

        .timeline-date {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .timeline-body {
            font-size: 12px;
            line-height: 1.5;
            color: var(--vscode-foreground);
            margin-top: 4px;
        }

        .review-state {
            display: inline-block;
            padding: 1px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
        }

        .review-approved { background: #22863a22; color: #22863a; }
        .review-changes { background: #e3600022; color: #e36000; }
        .review-commented { background: #0366d622; color: #0366d6; }
        .review-dismissed { background: #6a737d22; color: #6a737d; }
        .review-pending { background: #dbab0922; color: #dbab09; }

        /* Merge */
        .merge-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
        }

        .merge-select {
            padding: 8px 12px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-size: 12px;
            font-family: inherit;
        }

        .merge-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${ACCENT};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
        }

        .merge-btn:hover { opacity: 0.85; }
        .merge-btn:active { transform: scale(0.97); }

        .merge-btn-disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .merge-btn-disabled:hover { opacity: 0.4; }
        .merge-btn-disabled:active { transform: none; }

        .merge-hint {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
        }

        .pr-error {
            padding: 16px;
            border-radius: 8px;
            background: #cb243615;
            color: #cb2436;
            font-size: 13px;
            margin-bottom: 16px;
        }
    `;

    const body = `
    <div class="pr-toolbar">
        <button class="pr-back-link" id="backBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar à lista de PRs
        </button>
    </div>

    ${errorHtml}
    ${headerHtml}
    ${bodyHtml}
    ${checksHtml}
    ${timelineHtml}
    ${mergeHtml}`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToPrList' });
        });

        const mergeBtn = document.getElementById('mergeBtn');
        if (mergeBtn && !mergeBtn.disabled) {
            mergeBtn.addEventListener('click', () => {
                const method = document.getElementById('mergeMethod').value;
                vscode.postMessage({ command: 'executeMerge', prNumber: ${pr.number}, method });
            });
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: `PR #${pr.number} - ${pr.title}` });
}
