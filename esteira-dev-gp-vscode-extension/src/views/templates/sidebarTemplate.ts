import { type StageInfo } from '../../data/stages';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export type JiraFilter = 'mine' | 'all';

export interface JiraSidebarState {
    loggedIn: boolean;
    userEmail?: string;
    filter?: JiraFilter;
    issues?: Array<{
        key: string;
        summary: string;
        statusName: string;
        statusColor: string;
        priorityName: string;
        typeName: string;
    }>;
    loading?: boolean;
    error?: string;
}

export function getSidebarHtml(stages: StageInfo[], jiraState?: JiraSidebarState): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const cardsHtml = stages.map(
        (stage) => `
            <button class="stage-card" data-stage="${stage.id}" style="--accent: ${stage.color}">
                <div class="card-icon">${stage.icon}</div>
                <div class="card-content">
                    <h3>${stage.title}</h3>
                    <p>${stage.description}</p>
                </div>
                <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </button>`
    ).join('\n');

    const pipelineDots = stages.map((s, i) => {
        const dot = `<div class="pipeline-dot" style="background: ${s.color}"></div>`;
        const connector = i < stages.length - 1 ? '<div class="pipeline-connector"></div>' : '';
        return dot + connector;
    }).join('');

    const jiraHtml = buildJiraSection(jiraState);

    const styles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: transparent;
            padding: 12px 8px;
        }

        .header {
            text-align: center;
            padding: 8px 0 16px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            margin-bottom: 16px;
        }

        .header h1 {
            font-size: 14px;
            font-weight: 600;
            color: var(--vscode-foreground);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .header .subtitle {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .pipeline-flow {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin-top: 10px;
        }

        .pipeline-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            opacity: 0.8;
        }

        .pipeline-connector {
            width: 16px;
            height: 2px;
            background: var(--vscode-descriptionForeground);
            align-self: center;
            opacity: 0.4;
        }

        .stages {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .stage-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 6px;
            background: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.15s ease;
            width: 100%;
            text-align: left;
            color: var(--vscode-foreground);
            font-family: inherit;
            font-size: inherit;
            border-left: 3px solid var(--accent);
        }

        .stage-card:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--accent);
        }

        .stage-card:active {
            transform: scale(0.98);
        }

        .card-icon {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background: color-mix(in srgb, var(--accent) 15%, transparent);
            padding: 5px;
        }

        .card-icon svg {
            width: 18px;
            height: 18px;
            stroke: var(--accent);
        }

        .card-content {
            flex: 1;
            min-width: 0;
        }

        .card-content h3 {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .card-content p {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-arrow {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            opacity: 0.4;
            transition: opacity 0.15s ease;
        }

        .card-arrow svg {
            width: 16px;
            height: 16px;
        }

        .stage-card:hover .card-arrow {
            opacity: 0.8;
        }

        /* Jira section */
        .jira-separator {
            border: none;
            border-top: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            margin: 20px 0 16px;
        }

        .jira-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .jira-header h2 {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .jira-header h2 svg {
            width: 16px;
            height: 16px;
        }

        .jira-user-email {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }

        .jira-actions {
            display: flex;
            gap: 6px;
            margin-bottom: 10px;
        }

        .jira-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            font-weight: 500;
            font-family: inherit;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            transition: background 0.15s ease;
        }

        .jira-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .jira-btn.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .jira-btn.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .jira-btn.full-width {
            width: 100%;
            padding: 8px;
            font-size: 12px;
        }

        .jira-issues {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .jira-issue {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 10px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 5px;
            background: var(--vscode-editor-background);
            cursor: pointer;
            transition: all 0.15s ease;
            width: 100%;
            text-align: left;
            color: var(--vscode-foreground);
            font-family: inherit;
            font-size: inherit;
            border-left: 3px solid #0065FF;
        }

        .jira-issue:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: #0065FF;
        }

        .jira-issue-key {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
            white-space: nowrap;
        }

        .jira-issue-summary {
            font-size: 11px;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .jira-issue-status {
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 3px;
            font-weight: 600;
            color: white;
            white-space: nowrap;
        }

        .jira-loading {
            text-align: center;
            padding: 12px;
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
        }

        .jira-error {
            font-size: 11px;
            color: var(--vscode-errorForeground);
            padding: 8px;
            background: var(--vscode-inputValidation-errorBackground, rgba(255,0,0,0.1));
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .jira-empty {
            text-align: center;
            padding: 12px;
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
        }

        .jira-logout-link {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            background: none;
            border: none;
            font-family: inherit;
            text-decoration: underline;
            padding: 0;
        }

        .jira-logout-link:hover {
            color: var(--vscode-foreground);
        }

        .jira-filter {
            margin-bottom: 10px;
        }

        .jira-filter select {
            width: 100%;
            padding: 5px 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-family: var(--vscode-font-family);
            font-size: 11px;
        }

        .jira-filter select:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
    `;

    const body = `
    <div class="header">
        <h1>Esteira Growth</h1>
        <p class="subtitle">Pipeline de desenvolvimento</p>
        <div class="pipeline-flow">
            ${pipelineDots}
        </div>
    </div>

    <div class="stages">
        ${cardsHtml}
    </div>

    <hr class="jira-separator">

    <div id="jiraSection">
        ${jiraHtml}
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.querySelectorAll('.stage-card').forEach(card => {
            card.addEventListener('click', () => {
                const stageId = card.getAttribute('data-stage');
                vscode.postMessage({ command: 'openStage', stageId });
            });
        });

        // Jira event delegation
        const jiraSection = document.getElementById('jiraSection');
        jiraSection.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) { return; }

            const action = target.getAttribute('data-action');
            switch (action) {
                case 'jiraLogin':
                    vscode.postMessage({ command: 'jiraLogin' });
                    break;
                case 'jiraLogout':
                    vscode.postMessage({ command: 'jiraLogout' });
                    break;
                case 'jiraRefresh':
                    vscode.postMessage({ command: 'jiraRefresh' });
                    break;
                case 'jiraCreateIssue':
                    vscode.postMessage({ command: 'jiraCreateIssue' });
                    break;
                case 'jiraOpenIssue':
                    vscode.postMessage({ command: 'jiraOpenIssue', issueKey: target.getAttribute('data-key') });
                    break;
            }
        });

        jiraSection.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'jiraFilterSelect') {
                vscode.postMessage({ command: 'jiraFilterChange', filter: e.target.value });
            }
        });

        // Listen for Jira state updates from the extension
        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (msg.command === 'jiraState') {
                document.getElementById('jiraSection').innerHTML = msg.html;
            }
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira Growth' });
}

function buildJiraSection(state?: JiraSidebarState): string {
    const jiraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;

    if (!state || !state.loggedIn) {
        return `
            <button class="stage-card" data-action="jiraLogin" style="--accent: #0065FF">
                <div class="card-icon">${jiraIcon}</div>
                <div class="card-content">
                    <h3>Jira</h3>
                    <p>Conectar ao Jira</p>
                </div>
                <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </button>`;
    }

    const emailLine = state.userEmail
        ? `<div class="jira-user-email">${escapeHtml(state.userEmail)}</div>`
        : '';

    const errorLine = state.error
        ? `<div class="jira-error">${escapeHtml(state.error)}</div>`
        : '';

    const currentFilter = state.filter || 'mine';
    const filterHtml = `
        <div class="jira-filter">
            <select id="jiraFilterSelect">
                <option value="mine"${currentFilter === 'mine' ? ' selected' : ''}>Minhas issues</option>
                <option value="all"${currentFilter === 'all' ? ' selected' : ''}>Todas do projeto</option>
            </select>
        </div>`;

    let issuesHtml: string;
    if (state.loading) {
        issuesHtml = '<div class="jira-loading">Carregando issues...</div>';
    } else if (!state.issues || state.issues.length === 0) {
        issuesHtml = '<div class="jira-empty">Nenhuma issue encontrada</div>';
    } else {
        const items = state.issues.map((issue) => `
            <button class="jira-issue" data-action="jiraOpenIssue" data-key="${escapeAttr(issue.key)}">
                <span class="jira-issue-key">${escapeHtml(issue.key)}</span>
                <span class="jira-issue-summary">${escapeHtml(issue.summary)}</span>
                <span class="jira-issue-status" style="background:${issue.statusColor}">${escapeHtml(issue.statusName)}</span>
            </button>`
        ).join('\n');
        issuesHtml = `<div class="jira-issues">${items}</div>`;
    }

    return `
        <div class="jira-header">
            <h2>${jiraIcon} Jira</h2>
            <button class="jira-logout-link" data-action="jiraLogout">Desconectar</button>
        </div>
        ${emailLine}
        ${errorLine}
        <div class="jira-actions">
            <button class="jira-btn" data-action="jiraCreateIssue">Criar Issue</button>
            <button class="jira-btn secondary" data-action="jiraRefresh">Atualizar</button>
        </div>
        ${filterHtml}
        ${issuesHtml}`;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
