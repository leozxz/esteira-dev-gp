import { type StageInfo } from '../../data/stages';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export interface GhAuthState {
    loggedIn: boolean;
    username?: string;
}

export interface JiraCardInfo {
    key: string;
    url: string;
    summary?: string;
}

export function getVersionamentoHtml(stage: StageInfo, ghAuth?: GhAuthState, jiraCard?: JiraCardInfo): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const cards = [
        {
            id: 'createBranch',
            title: 'Criar Branch',
            description: 'Crie branches feat/bug/hotfix a partir de main atualizada.',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`, label: 'feat/' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`, label: 'bug/' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label: 'hotfix/' },
            ],
        },
        {
            id: 'mergeHml',
            title: 'Merge HML',
            description: 'Prepare o merge da sua branch em homologacao com deteccao de conflitos.',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/></svg>`, label: 'Conflitos' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`, label: 'PR' },
            ],
        },
        {
            id: 'mergeMain',
            title: 'Merge Main',
            description: 'Verifique conflitos com main e prepare o merge para producao.',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/></svg>`, label: 'Conflitos' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`, label: 'PR' },
            ],
        },
        {
            id: 'createPr',
            title: 'Abrir PR',
            description: 'Crie um Pull Request da branch atual para a branch de destino.',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`, label: 'Branch atual' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`, label: 'GitHub' },
            ],
        },
        {
            id: 'pullRequests',
            title: 'Pull Requests',
            description: 'Listar, revisar e fazer merge de Pull Requests do repositório.',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, label: 'Listar PRs' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/></svg>`, label: 'Reviews' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`, label: 'Merge' },
            ],
        },
    ];

    const cardsHtml = cards.map(card => `
            <div class="dev-card dev-card-active" data-card="${card.id}">
                <div class="dev-card-icon">${card.icon}</div>
                <div class="dev-card-body">
                    <h3>${card.title}</h3>
                    <p class="dev-card-desc">${card.description}</p>
                    <div class="dev-card-features">
                        ${card.features.map(f => `<span class="dev-card-feature-tag">${f.icon} ${f.label}</span>`).join('\n                        ')}
                    </div>
                </div>
            </div>
        `).join('\n');

    const styles = getBaseStyles(stage.color) + `
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
            transition: border-color 0.15s ease;
        }

        .dev-card:hover {
            border-color: ${stage.color};
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

        .dev-card-active {
            cursor: pointer;
            border-color: color-mix(in srgb, ${stage.color} 40%, transparent);
        }

        .dev-card-active:hover {
            border-color: ${stage.color};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${stage.color} 30%, transparent);
        }

        .dev-card-features {
            display: flex;
            gap: 6px;
            margin-top: 8px;
            margin-bottom: 14px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .dev-card-feature-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: var(--vscode-badge-background, rgba(255,255,255,0.08));
            color: var(--vscode-badge-foreground, var(--vscode-descriptionForeground));
        }

        .dev-card-feature-tag svg {
            width: 10px;
            height: 10px;
        }

        .gh-auth-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 12px;
        }

        .gh-auth-bar.disconnected {
            background: color-mix(in srgb, #f59e0b 12%, transparent);
            border: 1px solid color-mix(in srgb, #f59e0b 40%, transparent);
        }

        .gh-auth-bar.connected {
            background: color-mix(in srgb, #22c55e 12%, transparent);
            border: 1px solid color-mix(in srgb, #22c55e 40%, transparent);
        }

        .gh-auth-bar svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .gh-auth-info {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }

        .gh-auth-btn {
            padding: 4px 12px;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            background: #238636;
            color: #fff;
        }

        .gh-auth-btn:hover {
            background: #2ea043;
        }

        .gh-auth-btn.logout {
            background: transparent;
            color: var(--vscode-descriptionForeground);
            text-decoration: underline;
            padding: 4px 8px;
            font-weight: 400;
        }

        .jira-card-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 12px;
            background: color-mix(in srgb, #0065FF 12%, transparent);
            border: 1px solid color-mix(in srgb, #0065FF 40%, transparent);
        }

        .jira-card-bar svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            color: #0065FF;
        }

        .jira-card-bar a {
            color: #0065FF;
            font-weight: 600;
            text-decoration: none;
        }

        .jira-card-bar a:hover {
            text-decoration: underline;
        }

        .jira-card-bar .jira-summary {
            color: var(--vscode-descriptionForeground);
            margin-left: 4px;
        }
    `;

    const ghIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

    let ghAuthHtml: string;
    if (ghAuth?.loggedIn) {
        ghAuthHtml = `
        <div class="gh-auth-bar connected">
            <div class="gh-auth-info">
                ${ghIcon}
                <span>Conectado como <strong>@${ghAuth.username || '?'}</strong></span>
            </div>
            <button class="gh-auth-btn logout" id="ghLogoutBtn">Desconectar</button>
        </div>`;
    } else {
        ghAuthHtml = `
        <div class="gh-auth-bar disconnected">
            <div class="gh-auth-info">
                ${ghIcon}
                <span>GitHub desconectado</span>
            </div>
            <button class="gh-auth-btn" id="ghLoginBtn">Conectar</button>
        </div>`;
    }

    const jiraIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8a4.36 4.36 0 0 0 4.34 4.34h1.8v1.72a4.36 4.36 0 0 0 4.34 4.34V7.63a.84.84 0 0 0-.83-.83H6.77zM2 11.6a4.35 4.35 0 0 0 4.35 4.35h1.78v1.71c0 2.4 1.94 4.35 4.34 4.35V12.44a.84.84 0 0 0-.84-.84H2z"/></svg>`;

    let jiraCardHtml = '';
    if (jiraCard) {
        const summaryHtml = jiraCard.summary ? `<span class="jira-summary">— ${jiraCard.summary}</span>` : '';
        jiraCardHtml = `
        <div class="jira-card-bar">
            ${jiraIcon}
            <span>Card Jira: <a href="${jiraCard.url}" id="jiraCardLink">${jiraCard.key}</a>${summaryHtml}</span>
        </div>`;
    }

    const body = `
    <div class="stage-header">
        <div class="stage-icon">${stage.icon}</div>
        <div class="stage-title">
            <h1>${stage.title}</h1>
            <p>${stage.description}</p>
        </div>
    </div>

    ${ghAuthHtml}
    ${jiraCardHtml}

    <div class="dev-cards-grid">
        ${cardsHtml}
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        const ghLoginBtn = document.getElementById('ghLoginBtn');
        if (ghLoginBtn) {
            ghLoginBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'ghLogin' });
            });
        }

        const ghLogoutBtn = document.getElementById('ghLogoutBtn');
        if (ghLogoutBtn) {
            ghLogoutBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'ghLogout' });
            });
        }

        const jiraCardLink = document.getElementById('jiraCardLink');
        if (jiraCardLink) {
            jiraCardLink.addEventListener('click', (e) => {
                e.preventDefault();
                vscode.postMessage({ command: 'openJiraCard', url: jiraCardLink.getAttribute('href') });
            });
        }

        document.querySelectorAll('.dev-card-active').forEach(card => {
            card.addEventListener('click', () => {
                const cardId = card.getAttribute('data-card');
                if (cardId === 'createBranch') {
                    vscode.postMessage({ command: 'openCreateBranch' });
                } else if (cardId === 'mergeHml') {
                    vscode.postMessage({ command: 'openMergeHml' });
                } else if (cardId === 'mergeMain') {
                    vscode.postMessage({ command: 'openMergeMain' });
                } else if (cardId === 'createPr') {
                    vscode.postMessage({ command: 'openCreatePr' });
                } else if (cardId === 'pullRequests') {
                    vscode.postMessage({ command: 'openPrList' });
                }
            });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Versionamento' });
}
