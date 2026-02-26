import { type GitFileStatus } from '../../services/gitService';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface CommitViewState {
    currentBranch: string;
    branches: string[];
    files: GitFileStatus[];
    error?: string;
    gitUser: { name: string; email: string };
    ghUser: string | null;
    remoteUrl: string | null;
    isGitRepo: boolean;
    workspaceFolders: { name: string; path: string }[];
    selectedFolder: string;
}

const ACCENT_COLOR = '#3b82f6';

const COMMIT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>`;

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function statusLabel(status: string): string {
    switch (status) {
        case 'M': return 'Modificado';
        case 'A': return 'Adicionado';
        case 'D': return 'Deletado';
        case 'R': return 'Renomeado';
        case '??': return 'Não rastreado';
        default: return status;
    }
}

function statusColor(status: string): string {
    switch (status) {
        case 'M': return '#eab308';
        case 'A': return '#22c55e';
        case 'D': return '#ef4444';
        case 'R': return '#a78bfa';
        case '??': return '#6b7280';
        default: return '#9ca3af';
    }
}

export function getCommitHtml(state: CommitViewState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const branchOptions = state.branches
        .map(b => `<option value="${escapeHtml(b)}" ${b === state.currentBranch ? 'selected' : ''}>${escapeHtml(b)}</option>`)
        .join('');

    const stagedFiles = state.files.filter(f => f.staged);
    const unstagedFiles = state.files.filter(f => !f.staged);

    const renderFileList = (files: GitFileStatus[], isStaged: boolean) => {
        if (files.length === 0) {
            return `<div class="empty-list">Nenhum arquivo ${isStaged ? 'staged' : 'alterado'}</div>`;
        }
        return files.map(f => `
            <label class="file-item" data-file="${escapeHtml(f.file)}" data-staged="${isStaged}">
                <input type="checkbox" ${isStaged ? 'checked' : ''} data-action="${isStaged ? 'unstage' : 'stage'}" data-file="${escapeHtml(f.file)}" />
                <span class="file-status" style="color: ${statusColor(f.status)}" title="${statusLabel(f.status)}">${escapeHtml(f.status)}</span>
                <span class="file-name">${escapeHtml(f.file)}</span>
            </label>
        `).join('');
    };

    const styles = getBaseStyles(ACCENT_COLOR) + `
        .commit-container { max-width: 720px; margin: 0 auto; }

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

        /* ── Branch Section ── */
        .branch-row {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        .branch-select, .branch-input {
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
        .branch-select:focus, .branch-input:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
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

        /* ── Files Section ── */
        .files-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .files-actions {
            display: flex;
            gap: 6px;
        }
        .file-section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin: 12px 0 6px;
        }
        .file-section-title:first-child { margin-top: 0; }

        .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.1s ease;
        }
        .file-item:hover {
            background: color-mix(in srgb, var(--vscode-foreground) 6%, transparent);
        }
        .file-item input[type="checkbox"] {
            accent-color: ${ACCENT_COLOR};
            cursor: pointer;
        }
        .file-status {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            font-weight: 700;
            min-width: 20px;
            text-align: center;
        }
        .file-name {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .empty-list {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
            padding: 8px 0;
            font-style: italic;
        }
        .file-count {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            background: color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
            padding: 2px 8px;
            border-radius: 10px;
        }

        /* ── Commit Section ── */
        .commit-textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            resize: vertical;
            line-height: 1.5;
        }
        .commit-textarea:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }
        .commit-textarea::placeholder {
            color: var(--vscode-descriptionForeground);
            opacity: 0.6;
        }
        .commit-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            justify-content: flex-end;
            flex-wrap: wrap;
        }

        /* ── Buttons ── */
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

        .btn-complete {
            padding: 8px 20px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            background: transparent;
            color: var(--vscode-foreground);
            transition: background 0.15s ease;
        }
        .btn-complete:hover {
            background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
        }
        .btn-complete:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .btn-small {
            padding: 4px 12px;
            font-size: 11px;
        }

        .btn-ai {
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            border: none;
            color: #fff;
        }
        .btn-ai:hover { opacity: 0.85; }

        /* ── Back ── */
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

        /* ── Error ── */
        .error-banner {
            background: color-mix(in srgb, #ef4444 12%, transparent);
            border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #ef4444;
        }

        /* ── Repo Section ── */
        .repo-user-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }
        .repo-user-row .user-icon {
            width: 14px; height: 14px;
            opacity: 0.8;
        }
        .repo-user-row .gh-user {
            color: var(--vscode-descriptionForeground);
        }
        .repo-folder-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .repo-folder-row .folder-icon { font-size: 14px; }
        .folder-select {
            flex: 1;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: inherit;
            font-size: 12px;
        }
        .folder-select:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }
        .repo-remote-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
            word-break: break-all;
        }
        .repo-remote-row a {
            color: ${ACCENT_COLOR};
            text-decoration: none;
        }
        .repo-remote-row a:hover {
            text-decoration: underline;
        }
        .repo-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .remote-input {
            flex: 1;
            min-width: 200px;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            background: var(--vscode-input-background, var(--vscode-editor-background));
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }
        .remote-input:focus {
            outline: none;
            border-color: ${ACCENT_COLOR};
        }
        .remote-input-row {
            display: none;
            gap: 8px;
            align-items: center;
            margin-top: 10px;
        }
        .remote-input-row.visible {
            display: flex;
        }

        /* ── Loading Indicator ── */
        .ai-loading {
            display: none;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 8px;
        }
        .ai-loading.visible { display: flex; }
        .ai-spinner {
            width: 14px; height: 14px;
            border: 2px solid color-mix(in srgb, ${ACCENT_COLOR} 20%, transparent);
            border-top-color: ${ACCENT_COLOR};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;

    const errorHtml = state.error
        ? `<div class="error-banner">${escapeHtml(state.error)}</div>`
        : '';

    const body = `
    <button class="back-link" id="backBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar ao menu
    </button>

    <div class="stage-header">
        <div class="stage-icon">${COMMIT_ICON}</div>
        <div class="stage-title">
            <h1>Commit</h1>
            <p>Gerencie branches, selecione arquivos e crie commits</p>
        </div>
    </div>

    ${errorHtml}

    <div class="commit-container">
        <!-- Repository Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                Repositório
            </div>

            ${state.gitUser.name || state.gitUser.email ? `
            <div class="repo-user-row">
                <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>${escapeHtml(state.gitUser.name)}${state.gitUser.email ? ` &lt;${escapeHtml(state.gitUser.email)}&gt;` : ''}</span>
                ${state.ghUser ? `<span class="gh-user">&middot; @${escapeHtml(state.ghUser)}</span>` : ''}
            </div>` : ''}

            ${state.workspaceFolders.length > 1 ? `
            <div class="repo-folder-row">
                <span class="folder-icon">📁</span>
                <select class="folder-select" id="folderSelect">
                    ${state.workspaceFolders.map(f =>
                        `<option value="${escapeHtml(f.path)}" ${f.path === state.selectedFolder ? 'selected' : ''}>${escapeHtml(f.name)}</option>`
                    ).join('')}
                </select>
            </div>` : ''}

            ${!state.isGitRepo ? `
            <div class="repo-actions">
                <button class="btn-execute btn-small" id="initRepoBtn">Inicializar Git</button>
            </div>` : state.remoteUrl ? `
            <div class="repo-remote-row">
                <svg style="width:14px;height:14px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>${escapeHtml(state.remoteUrl)}</span>
            </div>` : `
            <div class="repo-actions">
                <button class="btn-execute btn-small" id="ghCreateRepoBtn">Criar Repo no GitHub</button>
                <button class="btn-complete btn-small" id="showAddRemoteBtn">Vincular Repo Existente</button>
            </div>
            <div class="remote-input-row" id="addRemoteRow">
                <input type="text" class="remote-input" id="remoteUrlInput" placeholder="https://github.com/user/repo.git" />
                <button class="btn-execute btn-small" id="addRemoteBtn">Vincular</button>
            </div>`}
        </div>

        <!-- Branch Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                Branch
            </div>
            <div class="branch-current">
                Branch atual: <span class="branch-current-name">${escapeHtml(state.currentBranch)}</span>
            </div>
            <div class="branch-row">
                <select class="branch-select" id="branchSelect">
                    ${branchOptions}
                </select>
                <button class="btn-execute btn-small" id="switchBranchBtn">Trocar</button>
            </div>
            <div class="branch-row" style="margin-top: 10px;">
                <input type="text" class="branch-input" id="newBranchInput" placeholder="Nome da nova branch..." />
                <button class="btn-complete btn-small" id="createBranchBtn">Criar Branch</button>
            </div>
        </div>

        <!-- Changed Files Section -->
        <div class="meta-card">
            <div class="files-header">
                <div class="card-title" style="margin-bottom: 0;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Arquivos Alterados
                    <span class="file-count">${state.files.length}</span>
                </div>
                <div class="files-actions">
                    <button class="btn-complete btn-small" id="stageAllBtn">Marcar Todos</button>
                    <button class="btn-complete btn-small" id="unstageAllBtn">Desmarcar Todos</button>
                    <button class="btn-complete btn-small" id="refreshBtn" title="Atualizar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;vertical-align:middle"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    </button>
                </div>
            </div>

            <div class="file-section-title">Staged (${stagedFiles.length})</div>
            ${renderFileList(stagedFiles, true)}

            <div class="file-section-title">Unstaged (${unstagedFiles.length})</div>
            ${renderFileList(unstagedFiles, false)}
        </div>

        <!-- Commit Message Section -->
        <div class="meta-card">
            <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Mensagem de Commit
            </div>
            <textarea class="commit-textarea" id="commitMessage" placeholder="Descreva suas alterações..."></textarea>
            <div class="ai-loading" id="aiLoading">
                <div class="ai-spinner"></div>
                Gerando mensagem com IA...
            </div>
            <div class="commit-actions">
                <button class="btn-execute btn-small btn-ai" id="generateMsgBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;vertical-align:middle;margin-right:4px"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Gerar com IA
                </button>
                <button class="btn-execute" id="commitBtn" ${stagedFiles.length === 0 ? 'disabled' : ''}>Commit</button>
            </div>
        </div>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        // ── Back ──
        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });

        // ── Repository ──
        const folderSelect = document.getElementById('folderSelect');
        if (folderSelect) {
            folderSelect.addEventListener('change', () => {
                vscode.postMessage({ command: 'selectFolder', path: folderSelect.value });
            });
        }

        const initRepoBtn = document.getElementById('initRepoBtn');
        if (initRepoBtn) {
            initRepoBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'initRepo' });
            });
        }

        const ghCreateRepoBtn = document.getElementById('ghCreateRepoBtn');
        if (ghCreateRepoBtn) {
            ghCreateRepoBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'ghCreateRepo' });
            });
        }

        const showAddRemoteBtn = document.getElementById('showAddRemoteBtn');
        if (showAddRemoteBtn) {
            showAddRemoteBtn.addEventListener('click', () => {
                const row = document.getElementById('addRemoteRow');
                if (row) { row.classList.toggle('visible'); }
            });
        }

        const addRemoteBtn = document.getElementById('addRemoteBtn');
        if (addRemoteBtn) {
            addRemoteBtn.addEventListener('click', () => {
                const input = document.getElementById('remoteUrlInput');
                const url = input ? input.value.trim() : '';
                if (url) {
                    vscode.postMessage({ command: 'addRemote', url });
                }
            });
        }

        const remoteUrlInput = document.getElementById('remoteUrlInput');
        if (remoteUrlInput) {
            remoteUrlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && addRemoteBtn) { addRemoteBtn.click(); }
            });
        }

        // ── Branch ──
        document.getElementById('switchBranchBtn').addEventListener('click', () => {
            const branch = document.getElementById('branchSelect').value;
            vscode.postMessage({ command: 'switchBranch', branch });
        });

        document.getElementById('createBranchBtn').addEventListener('click', () => {
            const name = document.getElementById('newBranchInput').value.trim();
            if (name) {
                vscode.postMessage({ command: 'createBranch', branch: name });
            }
        });

        document.getElementById('newBranchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('createBranchBtn').click();
            }
        });

        // ── Files ──
        document.querySelectorAll('.file-item input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const action = cb.getAttribute('data-action');
                const file = cb.getAttribute('data-file');
                if (action === 'stage') {
                    vscode.postMessage({ command: 'stageFile', file });
                } else {
                    vscode.postMessage({ command: 'unstageFile', file });
                }
            });
        });

        document.getElementById('stageAllBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'stageAll' });
        });

        document.getElementById('unstageAllBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'unstageAll' });
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refreshGitStatus' });
        });

        // ── Commit ──
        document.getElementById('commitBtn').addEventListener('click', () => {
            const message = document.getElementById('commitMessage').value.trim();
            if (!message) {
                return;
            }
            vscode.postMessage({ command: 'commitChanges', message });
        });

        // ── AI Generate ──
        document.getElementById('generateMsgBtn').addEventListener('click', () => {
            document.getElementById('aiLoading').classList.add('visible');
            document.getElementById('generateMsgBtn').disabled = true;
            vscode.postMessage({ command: 'generateCommitMessage' });
        });

        // ── Receive messages from extension ──
        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.command === 'setCommitMessage') {
                document.getElementById('commitMessage').value = msg.message;
                document.getElementById('aiLoading').classList.remove('visible');
                document.getElementById('generateMsgBtn').disabled = false;
            }
            if (msg.command === 'aiError') {
                document.getElementById('aiLoading').classList.remove('visible');
                document.getElementById('generateMsgBtn').disabled = false;
            }
        });

        // ── Enable/disable commit button based on textarea ──
        const commitBtn = document.getElementById('commitBtn');
        const textarea = document.getElementById('commitMessage');
        const hasStagedFiles = ${stagedFiles.length > 0};

        textarea.addEventListener('input', () => {
            commitBtn.disabled = !textarea.value.trim() || !hasStagedFiles;
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Commit' });
}
