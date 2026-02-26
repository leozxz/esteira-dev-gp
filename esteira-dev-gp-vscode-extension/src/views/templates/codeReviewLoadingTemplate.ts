import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';
import { QUALITY_CATEGORIES, SECURITY_CATEGORIES } from '../../services/codeReviewProgressDetector';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildChecklistItems(names: string[], prefix: string): string {
    return names.map((name, i) => `
        <div class="check-item" id="${prefix}-${i}" data-status="pending">
            <div class="check-icon">
                <svg class="icon-pending" width="18" height="18" viewBox="0 0 18 18">
                    <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"/>
                </svg>
                <svg class="icon-active" width="18" height="18" viewBox="0 0 18 18" style="display:none">
                    <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="44" stroke-dashoffset="0">
                        <animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="1s" repeatCount="indefinite"/>
                    </circle>
                </svg>
                <svg class="icon-done" width="18" height="18" viewBox="0 0 18 18" style="display:none">
                    <circle cx="9" cy="9" r="7" fill="currentColor" opacity="0.15"/>
                    <path d="M6 9.5l2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="check-name">${escapeHtml(name)}</span>
            <span class="check-score" id="${prefix}-score-${i}"></span>
        </div>
    `).join('');
}

export function getCodeReviewLoadingHtml(targetPath: string, accentColor: string): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const qualityItemsHtml = buildChecklistItems(QUALITY_CATEGORIES, 'q');
    const securityItemsHtml = buildChecklistItems(SECURITY_CATEGORIES, 's');

    const styles = getBaseStyles(accentColor) + `
        .review-container {
            max-width: 720px;
            margin: 0 auto;
        }

        /* ── Header ── */
        .review-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .header-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${accentColor};
            animation: header-pulse 2s ease-in-out infinite;
        }

        @keyframes header-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .review-header h2 {
            flex: 1;
            font-size: 18px;
            font-weight: 600;
        }

        .timer {
            font-size: 16px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            color: ${accentColor};
            font-family: var(--vscode-editor-font-family, monospace);
        }

        /* ── Progress Bar ── */
        .progress-section {
            margin-bottom: 24px;
        }

        .progress-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .progress-phase {
            font-size: 13px;
            font-weight: 500;
            color: ${accentColor};
        }

        .progress-count {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-variant-numeric: tabular-nums;
        }

        .progress-bar {
            height: 6px;
            border-radius: 3px;
            background: color-mix(in srgb, ${accentColor} 12%, transparent);
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            border-radius: 3px;
            background: ${accentColor};
            width: 0%;
            transition: width 0.5s ease;
        }

        .file-path {
            margin-top: 8px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            word-break: break-all;
            font-family: var(--vscode-editor-font-family, monospace);
            opacity: 0.7;
        }

        /* ── Checklists ── */
        .checklists {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }

        @media (max-width: 560px) {
            .checklists { grid-template-columns: 1fr; }
        }

        .checklist-section {
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            padding: 16px;
        }

        .checklist-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .checklist-title svg {
            width: 16px;
            height: 16px;
            stroke: ${accentColor};
            fill: none;
        }

        .check-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 0;
            transition: opacity 0.3s ease;
        }

        .check-item[data-status="pending"] {
            opacity: 0.4;
        }

        .check-item[data-status="active"] {
            opacity: 1;
        }

        .check-item[data-status="active"] .check-name {
            color: ${accentColor};
            font-weight: 500;
        }

        .check-item[data-status="done"] {
            opacity: 1;
        }

        .check-item[data-status="done"] .check-icon {
            color: #22c55e;
        }

        .check-icon {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            color: var(--vscode-descriptionForeground);
        }

        .check-item[data-status="active"] .check-icon {
            color: ${accentColor};
        }

        .check-name {
            flex: 1;
            font-size: 12px;
            line-height: 1.3;
        }

        .check-score {
            font-size: 11px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            min-width: 28px;
            text-align: right;
            font-family: var(--vscode-editor-font-family, monospace);
        }

        .check-item[data-status="done"] .check-score {
            color: #22c55e;
        }

        /* ── Activity Bar ── */
        .activity-section {
            margin-bottom: 20px;
        }

        .activity-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 8px;
            background: color-mix(in srgb, ${accentColor} 8%, transparent);
            border: 1px solid color-mix(in srgb, ${accentColor} 20%, transparent);
            font-size: 12px;
            color: ${accentColor};
            font-weight: 500;
        }

        .activity-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid color-mix(in srgb, ${accentColor} 25%, transparent);
            border-top-color: ${accentColor};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ── Tool Activity Log ── */
        .activity-log-section {
            margin-bottom: 20px;
        }

        .activity-log-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .activity-log {
            max-height: 140px;
            overflow-y: auto;
            border-radius: 8px;
            background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            padding: 8px 12px;
        }

        .activity-log-empty {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.6;
            font-style: italic;
        }

        .activity-log-item {
            font-size: 11px;
            font-family: var(--vscode-editor-font-family, monospace);
            color: var(--vscode-descriptionForeground);
            padding: 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            animation: fadeIn 0.3s ease;
        }

        .activity-log-item:last-child {
            color: var(--vscode-foreground);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ── Live Output ── */
        .output-section {
            margin-bottom: 20px;
        }

        .output-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            border: none;
            background: none;
            padding: 4px 0;
            font-family: inherit;
        }

        .output-toggle:hover {
            color: var(--vscode-foreground);
        }

        .output-toggle svg {
            width: 12px;
            height: 12px;
            transition: transform 0.2s ease;
        }

        .output-toggle.expanded svg {
            transform: rotate(90deg);
        }

        .output-box {
            display: none;
            margin-top: 8px;
            max-height: 160px;
            overflow-y: auto;
            border-radius: 8px;
            background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            padding: 12px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            line-height: 1.5;
            color: var(--vscode-descriptionForeground);
            white-space: pre-wrap;
            word-break: break-word;
        }

        .output-box.visible {
            display: block;
        }

        /* ── Cancel Button ── */
        .actions {
            text-align: center;
        }

        .cancel-btn {
            padding: 8px 28px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            background: transparent;
            color: var(--vscode-foreground);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.15s ease;
        }

        .cancel-btn:hover {
            background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            border-color: var(--vscode-foreground);
        }
    `;

    const body = `
    <div class="review-container">
        <!-- Header -->
        <div class="review-header">
            <div class="header-dot"></div>
            <h2>Code Review em Andamento</h2>
            <div class="timer" id="timer">00:00</div>
        </div>

        <!-- Progress -->
        <div class="progress-section">
            <div class="progress-meta">
                <span class="progress-phase" id="phaseLabel">Analisando o código</span>
                <span class="progress-count" id="progressCount">0 de 14</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="file-path">${escapeHtml(targetPath)}</div>
        </div>

        <!-- Checklists -->
        <div class="checklists">
            <div class="checklist-section">
                <div class="checklist-title">
                    <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>
                    </svg>
                    Qualidade do Codigo
                </div>
                ${qualityItemsHtml}
            </div>
            <div class="checklist-section">
                <div class="checklist-title">
                    <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Seguranca
                </div>
                ${securityItemsHtml}
            </div>
        </div>

        <!-- Activity -->
        <div class="activity-section">
            <div class="activity-bar">
                <div class="activity-spinner"></div>
                <span id="currentActivity">Analisando o código...</span>
            </div>
        </div>

        <!-- Tool Activity Log -->
        <div class="activity-log-section">
            <div class="activity-log-title">Atividade do Claude</div>
            <div class="activity-log" id="activityLog">
                <div class="activity-log-empty" id="activityEmpty">Análise direta do código</div>
            </div>
        </div>

        <!-- Live Output -->
        <div class="output-section">
            <button class="output-toggle" id="outputToggle">
                <svg viewBox="0 0 12 12" fill="currentColor"><path d="M4 2l5 4-5 4V2z"/></svg>
                Output raw (debug)
            </button>
            <div class="output-box" id="outputBox"></div>
        </div>

        <!-- Actions -->
        <div class="actions">
            <button class="cancel-btn" id="cancelBtn">Cancelar</button>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();
        const start = Date.now();

        // Timer
        const timerEl = document.getElementById('timer');
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const secs = String(elapsed % 60).padStart(2, '0');
            timerEl.textContent = mins + ':' + secs;
        }, 1000);

        // Cancel
        document.getElementById('cancelBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'cancelReview' });
        });

        // Output toggle
        const toggleBtn = document.getElementById('outputToggle');
        const outputBox = document.getElementById('outputBox');
        let outputVisible = false;
        toggleBtn.addEventListener('click', () => {
            outputVisible = !outputVisible;
            outputBox.classList.toggle('visible', outputVisible);
            toggleBtn.classList.toggle('expanded', outputVisible);
            toggleBtn.querySelector('span') || null;
            if (outputVisible) {
                outputBox.scrollTop = outputBox.scrollHeight;
            }
        });

        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const msg = event.data;

            if (msg.command === 'progressUpdate') {
                const p = msg.progress;

                // Update progress bar
                const pct = p.totalCount > 0 ? (p.completedCount / p.totalCount) * 100 : 0;
                document.getElementById('progressFill').style.width = pct + '%';
                document.getElementById('progressCount').textContent = p.completedCount + ' de ' + p.totalCount;
                document.getElementById('phaseLabel').textContent = p.phaseLabel;
                document.getElementById('currentActivity').textContent = p.currentActivity;

                // Update quality items
                p.qualityItems.forEach(function(item, i) {
                    updateCheckItem('q-' + i, item.status, item.score, 'q-score-' + i);
                });

                // Update security items
                p.securityItems.forEach(function(item, i) {
                    updateCheckItem('s-' + i, item.status, item.score, 's-score-' + i);
                });
            }

            if (msg.command === 'activityUpdate') {
                const log = document.getElementById('activityLog');
                const empty = document.getElementById('activityEmpty');
                if (empty) empty.remove();

                const item = document.createElement('div');
                item.className = 'activity-log-item';
                item.textContent = msg.label;
                log.appendChild(item);
                log.scrollTop = log.scrollHeight;

                // Keep only last 30 items
                while (log.children.length > 30) log.removeChild(log.firstChild);
            }

            if (msg.command === 'outputChunk') {
                outputBox.textContent += msg.text;
                // Keep only last ~3000 chars to avoid memory issues
                if (outputBox.textContent.length > 3000) {
                    outputBox.textContent = '...' + outputBox.textContent.slice(-2500);
                }
                if (outputVisible) {
                    outputBox.scrollTop = outputBox.scrollHeight;
                }
            }
        });

        function updateCheckItem(itemId, status, score, scoreId) {
            const el = document.getElementById(itemId);
            if (!el) return;

            const prevStatus = el.getAttribute('data-status');
            if (prevStatus === status) return;

            el.setAttribute('data-status', status);

            // Toggle icons
            const pending = el.querySelector('.icon-pending');
            const active = el.querySelector('.icon-active');
            const done = el.querySelector('.icon-done');

            if (pending) pending.style.display = status === 'pending' ? '' : 'none';
            if (active) active.style.display = status === 'active' ? '' : 'none';
            if (done) done.style.display = status === 'done' ? '' : 'none';

            // Score
            if (score !== undefined && score !== null) {
                const scoreEl = document.getElementById(scoreId);
                if (scoreEl) {
                    scoreEl.textContent = score.toFixed(1);
                    if (score > 8) scoreEl.style.color = '#22c55e';
                    else if (score >= 6) scoreEl.style.color = '#eab308';
                    else scoreEl.style.color = '#ef4444';
                }
            }
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Code Review - Analisando...' });
}
