import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

const ACCENT_COLOR = '#3b82f6';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Estilos compartilhados pelas sub-views ──────────────────

function getSharedStyles(): string {
    return `
        .flow-container { max-width: 720px; margin: 0 auto; }

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

        .description-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            line-height: 1.6;
            margin-bottom: 14px;
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
            width: 100%;
            text-align: center;
        }
        .btn-execute:hover { opacity: 0.85; }
        .btn-execute:active { transform: scale(0.97); }
        .btn-execute:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-danger {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            background: #ef4444;
            color: #fff;
            transition: opacity 0.15s ease, transform 0.1s ease;
            width: 100%;
            text-align: center;
        }
        .btn-danger:hover { opacity: 0.85; }
        .btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-secondary {
            padding: 8px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            background: transparent;
            color: var(--vscode-foreground);
            transition: opacity 0.15s ease;
            width: 100%;
            text-align: center;
        }
        .btn-secondary:hover { background: var(--vscode-input-background); }
        .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

        .output-area {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 8px;
            padding: 14px;
            margin-top: 14px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            line-height: 1.7;
            max-height: 320px;
            overflow-y: auto;
            white-space: pre-wrap;
            display: none;
        }
        .output-area.visible { display: block; }
        .output-area .success { color: #22c55e; }
        .output-area .error { color: #ef4444; }
        .output-area .warning { color: #f59e0b; }
        .output-area .info { color: #3b82f6; }
        .output-area .step { color: var(--vscode-foreground); opacity: 0.7; }
        .output-area .muted { opacity: 0.55; }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #fff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            vertical-align: middle;
            margin-right: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Formulário */
        label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
        }

        select, input[type="text"], input[type="number"] {
            width: 100%;
            padding: 7px 10px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
            border-radius: 6px;
            font-size: 13px;
            font-family: inherit;
            margin-bottom: 12px;
        }
        select:focus, input:focus { outline: 1px solid ${ACCENT_COLOR}; }

        /* Segmented control */
        .segment-group {
            display: flex;
            gap: 2px;
            margin-bottom: 12px;
            background: var(--vscode-input-background);
            border-radius: 6px;
            padding: 3px;
        }
        .segment {
            flex: 1;
            padding: 7px 8px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: transparent;
            color: var(--vscode-foreground);
            opacity: 0.6;
            transition: all 0.15s;
            font-family: inherit;
        }
        .segment:hover { opacity: 0.8; }
        .segment.active { opacity: 1; color: #fff; }
        .segment.active.feat { background: #7c3aed; }
        .segment.active.bug { background: #ef4444; }
        .segment.active.hotfix { background: #b91c1c; }

        .preview-box {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 14px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            color: ${ACCENT_COLOR};
            font-weight: 600;
        }

        .info-box {
            background: color-mix(in srgb, ${ACCENT_COLOR} 8%, transparent);
            border-left: 3px solid ${ACCENT_COLOR};
            border-radius: 0 6px 6px 0;
            padding: 10px 14px;
            margin-bottom: 14px;
            font-size: 12px;
            line-height: 1.6;
            color: var(--vscode-descriptionForeground);
        }

        /* Branch list */
        .branch-list {
            max-height: 280px;
            overflow-y: auto;
            margin-bottom: 14px;
            display: none;
        }
        .branch-list.visible { display: block; }
        .branch-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 6px;
            margin-bottom: 2px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }
        .branch-item:hover { background: var(--vscode-input-background); }
        .branch-item input[type="checkbox"] { width: auto; margin: 0; }
    `;
}

const BACK_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

// ── Ícones ──────────────────────────────────────────────────

const BRANCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`;
const MERGE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/></svg>`;

// ════════════════════════════════════════════════════════════
// 1. Criar Branch
// ════════════════════════════════════════════════════════════

export interface CreateBranchViewState {
    currentBranch: string;
    projectCode: string;
}

export function getCreateBranchHtml(state: CreateBranchViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);
    const project = state.projectCode;

    const styles = getBaseStyles(ACCENT_COLOR) + getSharedStyles();

    const body = `
    <button class="back-link" id="backBtn">${BACK_ARROW} Voltar ao menu</button>

    <div class="stage-header">
        <div class="stage-icon">${BRANCH_ICON}</div>
        <div class="stage-title">
            <h1>Criar Branch</h1>
            <p>Crie uma branch a partir de main atualizada</p>
        </div>
    </div>

    <div class="flow-container">
        <div class="meta-card">
            <div class="card-title">
                ${BRANCH_ICON} Nova Branch
            </div>

            <div class="info-box">
                Criada a partir de <strong>main</strong> atualizada e publicada no remoto automaticamente.
            </div>

            <label>Tipo da branch</label>
            <div class="segment-group" id="branchType">
                <button class="segment active feat" data-type="feat">feat/</button>
                <button class="segment bug" data-type="bug">bug/</button>
                <button class="segment hotfix" data-type="hotfix">hotfix/</button>
            </div>

            <label>Numero do card Jira</label>
            <input type="number" id="cardNumber" placeholder="1234" min="1" />

            <label>Preview</label>
            <div class="preview-box" id="branchPreview">feat/${escapeHtml(project)}-____</div>

            <button class="btn-execute" id="btnCreate">Criar Branch</button>

            <div class="output-area" id="output"></div>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();
        const PROJECT = '${escapeHtml(project)}';

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        let selectedType = 'feat';
        document.querySelectorAll('#branchType .segment').forEach(seg => {
            seg.addEventListener('click', () => {
                document.querySelectorAll('#branchType .segment').forEach(s => s.classList.remove('active'));
                seg.classList.add('active');
                selectedType = seg.dataset.type;
                updatePreview();
            });
        });

        const cardInput = document.getElementById('cardNumber');
        cardInput.addEventListener('input', updatePreview);

        function updatePreview() {
            const num = cardInput.value || '____';
            document.getElementById('branchPreview').textContent = selectedType + '/' + PROJECT + '-' + num;
        }

        document.getElementById('btnCreate').addEventListener('click', () => {
            const num = cardInput.value;
            if (!num || num.length === 0) {
                showOutput('<span class="error">Informe o numero do card Jira.</span>');
                return;
            }
            setLoading('btnCreate', true);
            vscode.postMessage({ command: 'executeCreateBranch', type: selectedType, cardNumber: num });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'createBranchResult') {
                setLoading('btnCreate', false);
                const r = msg.result;
                if (r.success) {
                    let html = '<span class="success">\\u2705 ' + esc(r.message) + '</span>';
                    if (r.steps) {
                        r.steps.forEach(s => {
                            const icon = s.status === 'done' ? '\\u2713' : '\\u2717';
                            html += '\\n<span class="step">  ' + icon + ' ' + esc(s.step) + '</span>';
                        });
                    }
                    showOutput(html);
                } else {
                    let html = '<span class="error">\\u274c ' + esc(r.message) + '</span>';
                    if (r.steps) {
                        r.steps.forEach(s => {
                            const icon = s.status === 'done' ? '\\u2713' : s.status === 'error' ? '\\u2717' : '\\u00b7';
                            html += '\\n<span class="step">  ' + icon + ' ' + esc(s.step) + '</span>';
                        });
                    }
                    showOutput(html);
                }
            }
        });

        function showOutput(html) {
            const el = document.getElementById('output');
            el.innerHTML = html;
            el.classList.add('visible');
        }

        function setLoading(btnId, loading) {
            const btn = document.getElementById(btnId);
            if (loading) {
                btn.dataset.originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner"></span> Executando...';
                btn.disabled = true;
            } else {
                btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
                btn.disabled = false;
            }
        }

        function esc(str) {
            if (!str) return '';
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Criar Branch' });
}

// ════════════════════════════════════════════════════════════
// 2. Merge HML
// ════════════════════════════════════════════════════════════

export interface MergeViewState {
    currentBranch: string;
}

export function getMergeHmlHtml(state: MergeViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const styles = getBaseStyles(ACCENT_COLOR) + getSharedStyles();

    const body = `
    <button class="back-link" id="backBtn">${BACK_ARROW} Voltar ao menu</button>

    <div class="stage-header">
        <div class="stage-icon">${MERGE_ICON}</div>
        <div class="stage-title">
            <h1>Merge em HML</h1>
            <p>Prepare o merge da sua branch em homologacao</p>
        </div>
    </div>

    <div class="flow-container">
        <div class="meta-card">
            <div class="card-title">
                ${MERGE_ICON} Preparar Merge → HML
            </div>

            <p class="description-text">
                Verifica se sua branch atual (<strong>${escapeHtml(state.currentBranch)}</strong>) pode ser mergeada em <strong>hml</strong>.<br>
                <br>
                <strong>Sem conflitos</strong> → instrui a abrir PR no GitHub.<br>
                <strong>Com conflitos</strong> → cria branch <code>merge/</code> para resolver localmente.
            </p>

            <button class="btn-execute" id="btnMergeHml">Verificar e Preparar Merge → HML</button>

            <div class="output-area" id="output"></div>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        document.getElementById('btnMergeHml').addEventListener('click', () => {
            setLoading('btnMergeHml', true);
            vscode.postMessage({ command: 'executeMergeHml' });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'mergeHmlResult') {
                setLoading('btnMergeHml', false);
                showMergeResult(msg.result);
            }
        });

        function showMergeResult(r) {
            if (!r.success) {
                let html = '<span class="error">\\u274c ' + esc(r.message) + '</span>';
                if (r.suggestion) html += '\\n\\n<span class="muted">' + esc(r.suggestion) + '</span>';
                showOutput(html);
                return;
            }
            if (r.alreadyMerged) {
                let html = '<span class="info">\\u2139\\ufe0f ' + esc(r.message) + '</span>';
                if (r.suggestion) html += '\\n\\n<span class="info">' + esc(r.suggestion) + '</span>';
                showOutput(html);
                return;
            }
            if (r.hasConflicts) {
                showOutput('<span class="warning">\\u26a0\\ufe0f ' + esc(r.message) + '</span>\\n\\n<span class="info">' + esc(r.suggestion) + '</span>');
            } else {
                showOutput('<span class="success">\\u2705 ' + esc(r.message) + '</span>\\n\\n<span class="info">' + esc(r.suggestion) + '</span>');
            }
        }

        function showOutput(html) {
            const el = document.getElementById('output');
            el.innerHTML = html;
            el.classList.add('visible');
        }

        function setLoading(btnId, loading) {
            const btn = document.getElementById(btnId);
            if (loading) {
                btn.dataset.originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner"></span> Executando...';
                btn.disabled = true;
            } else {
                btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
                btn.disabled = false;
            }
        }

        function esc(str) {
            if (!str) return '';
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Merge HML' });
}

// ════════════════════════════════════════════════════════════
// 3. Merge Main
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
// Create PR
// ════════════════════════════════════════════════════════════

export interface CreatePrViewState {
    currentBranch: string;
    baseBranches: string[];
}

export function getCreatePrHtml(state: CreatePrViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const styles = getBaseStyles(ACCENT_COLOR) + getSharedStyles();

    const PR_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`;

    const branchOptions = state.baseBranches.map(b =>
        `<option value="${escapeHtml(b)}" ${b === 'hml' ? 'selected' : ''}>${escapeHtml(b)}</option>`
    ).join('\n');

    const body = `
    <button class="back-link" id="backBtn">${BACK_ARROW} Voltar ao menu</button>

    <div class="stage-header">
        <div class="stage-icon">${PR_ICON}</div>
        <div class="stage-title">
            <h1>Abrir Pull Request</h1>
            <p>Crie um PR da branch atual para a branch de destino</p>
        </div>
    </div>

    <div class="flow-container">
        <div class="meta-card">
            <div class="card-title">
                ${PR_ICON} Novo Pull Request
            </div>

            <div class="info-box">
                Branch de origem: <strong>${escapeHtml(state.currentBranch)}</strong>
            </div>

            <label>Branch de destino</label>
            <select id="baseBranch">
                ${branchOptions}
            </select>

            <label>Titulo do PR</label>
            <input type="text" id="prTitle" placeholder="Titulo do Pull Request" />

            <label>Descricao (opcional)</label>
            <textarea id="prBody" rows="4" style="width:100%;padding:7px 10px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,var(--vscode-panel-border));border-radius:6px;font-size:13px;font-family:inherit;margin-bottom:12px;resize:vertical;"></textarea>

            <button class="btn-execute" id="btnCreatePr">Criar Pull Request</button>

            <div class="output-area" id="output"></div>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        document.getElementById('btnCreatePr').addEventListener('click', () => {
            const base = document.getElementById('baseBranch').value;
            const title = document.getElementById('prTitle').value.trim();
            const body = document.getElementById('prBody').value.trim();
            if (!title) {
                showOutput('<span class="error">Informe o titulo do PR.</span>');
                return;
            }
            setLoading('btnCreatePr', true);
            vscode.postMessage({ command: 'executeCreatePr', base, title, body });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'createPrResult') {
                setLoading('btnCreatePr', false);
                if (msg.success) {
                    showOutput('<span class="success">\\u2705 PR criado com sucesso!</span>\\n\\n<span class="info"><a href="' + esc(msg.url) + '">' + esc(msg.url) + '</a></span>');
                } else {
                    showOutput('<span class="error">\\u274c ' + esc(msg.error) + '</span>');
                }
            }
        });

        function showOutput(html) {
            const el = document.getElementById('output');
            el.innerHTML = html;
            el.classList.add('visible');
        }

        function setLoading(btnId, loading) {
            const btn = document.getElementById(btnId);
            if (loading) {
                btn.dataset.originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner"></span> Criando PR...';
                btn.disabled = true;
            } else {
                btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
                btn.disabled = false;
            }
        }

        function esc(str) {
            if (!str) return '';
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Abrir PR' });
}

// ════════════════════════════════════════════════════════════
// 3. Merge Main
// ════════════════════════════════════════════════════════════

export function getMergeMainHtml(state: MergeViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const styles = getBaseStyles(ACCENT_COLOR) + getSharedStyles();

    const body = `
    <button class="back-link" id="backBtn">${BACK_ARROW} Voltar ao menu</button>

    <div class="stage-header">
        <div class="stage-icon">${MERGE_ICON}</div>
        <div class="stage-title">
            <h1>Merge em Main</h1>
            <p>Prepare o merge da sua branch em producao</p>
        </div>
    </div>

    <div class="flow-container">
        <div class="meta-card">
            <div class="card-title">
                ${MERGE_ICON} Preparar Merge → Main
            </div>

            <p class="description-text">
                Verifica se sua branch (<strong>${escapeHtml(state.currentBranch)}</strong>) passou por <strong>hml</strong> e pode ir para <strong>main</strong>.<br>
                <br>
                <strong>Sem conflitos</strong> → instrui a abrir PR no GitHub.<br>
                <strong>Com conflitos</strong> → cria branch <code>merge/</code> para resolver localmente.<br>
                <strong>Hotfix</strong> → pula a validacao de HML.
            </p>

            <button class="btn-execute" id="btnMergeMain">Verificar e Preparar Merge → Main</button>

            <div class="output-area" id="output"></div>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        document.getElementById('btnMergeMain').addEventListener('click', () => {
            setLoading('btnMergeMain', true);
            vscode.postMessage({ command: 'executeMergeMain' });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'mergeMainResult') {
                setLoading('btnMergeMain', false);
                showMergeResult(msg.result);
            }
        });

        function showMergeResult(r) {
            if (!r.success) {
                let html = '<span class="error">\\u274c ' + esc(r.message) + '</span>';
                if (r.suggestion) html += '\\n\\n<span class="muted">' + esc(r.suggestion) + '</span>';
                showOutput(html);
                return;
            }
            if (r.alreadyMerged) {
                let html = '<span class="info">\\u2139\\ufe0f ' + esc(r.message) + '</span>';
                if (r.suggestion) html += '\\n\\n<span class="info">' + esc(r.suggestion) + '</span>';
                showOutput(html);
                return;
            }
            if (r.hasConflicts) {
                showOutput('<span class="warning">\\u26a0\\ufe0f ' + esc(r.message) + '</span>\\n\\n<span class="info">' + esc(r.suggestion) + '</span>');
            } else {
                showOutput('<span class="success">\\u2705 ' + esc(r.message) + '</span>\\n\\n<span class="info">' + esc(r.suggestion) + '</span>');
            }
        }

        function showOutput(html) {
            const el = document.getElementById('output');
            el.innerHTML = html;
            el.classList.add('visible');
        }

        function setLoading(btnId, loading) {
            const btn = document.getElementById(btnId);
            if (loading) {
                btn.dataset.originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner"></span> Executando...';
                btn.disabled = true;
            } else {
                btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
                btn.disabled = false;
            }
        }

        function esc(str) {
            if (!str) return '';
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Merge Main' });
}

