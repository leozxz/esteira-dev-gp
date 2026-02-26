import { type StageInfo } from '../../data/stages';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export function getDesenvolvimentoHtml(stage: StageInfo): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const cards = [
        {
            id: 'novoProjeto',
            title: 'Novo Projeto',
            description: 'Crie uma nova pasta de projeto e abra no VS Code.',
            subtitle: 'Criar Projeto',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`, label: 'Criar Pasta' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label: 'Abrir VS Code' },
            ],
        },
        {
            id: 'pull',
            title: 'Pull',
            description: 'Atualize seu repositório local com as alterações remotas.',
            subtitle: 'Fazer Pull',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`, label: 'Pull' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`, label: 'Branches' },
            ],
        },
        {
            id: 'codereview',
            title: 'Code Review',
            description: 'Revisão de código com análise de qualidade e segurança usando IA. Gera nota de 0 a 10.',
            subtitle: 'Iniciar Review',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/></svg>`, label: 'Qualidade' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label: 'Segurança' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`, label: 'Nota 0-10' },
            ],
        },
        {
            id: 'commit',
            title: 'Commit',
            description: 'Geração de commits semânticos e padronizados.',
            subtitle: 'Criar Commit',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`, label: 'Branches' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`, label: 'Stage' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>`, label: 'Commit' },
            ],
        },
        {
            id: 'push',
            title: 'Push',
            description: 'Envie seus commits para o repositório remoto.',
            subtitle: 'Fazer Push',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`, label: 'Push' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`, label: 'Remote' },
            ],
        },
        {
            id: 'pr',
            title: 'PR',
            description: 'Crie Pull Requests para revisão e merge de código.',
            subtitle: 'Criar PR',
            active: true,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`,
            features: [
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`, label: 'Pull Request' },
                { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`, label: 'GitHub' },
            ],
        },
    ];

    const cardsHtml = cards.map(card => `
            <div class="dev-card ${card.active ? 'dev-card-active' : ''}" data-card="${card.id}">
                <div class="dev-card-icon">${card.icon}</div>
                <div class="dev-card-body">
                    <h3>${card.title}</h3>
                    <p class="dev-card-desc">${card.description}</p>
                    ${card.active && card.features.length > 0
                        ? `<div class="dev-card-features">
                            ${card.features.map(f => `<span class="dev-card-feature-tag">${f.icon} ${f.label}</span>`).join('\n                            ')}
                        </div>`
                        : !card.active
                            ? `<span class="dev-card-badge">${card.subtitle}</span>`
                            : ''
                    }
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

        .dev-card-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            background: color-mix(in srgb, ${stage.color} 15%, transparent);
            color: ${stage.color};
            letter-spacing: 0.3px;
        }

        .dev-card-active {
            cursor: pointer;
            border-color: color-mix(in srgb, ${stage.color} 40%, transparent);
        }

        .dev-card-active:hover {
            border-color: ${stage.color};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${stage.color} 30%, transparent);
        }

        .dev-card-btn {
            display: inline-block;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${stage.color};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }

        .dev-card-btn:hover {
            opacity: 0.85;
        }

        .dev-card-btn:active {
            transform: scale(0.97);
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
    `;

    const body = `
    <div class="stage-header">
        <div class="stage-icon">${stage.icon}</div>
        <div class="stage-title">
            <h1>${stage.title}</h1>
            <p>${stage.description}</p>
        </div>
    </div>

    <div class="dev-cards-grid">
        ${cardsHtml}
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.querySelectorAll('.dev-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'codereview') {
                    vscode.postMessage({ command: 'openCodeReview' });
                }
            });
        });

        document.querySelectorAll('.dev-card-active').forEach(card => {
            card.addEventListener('click', () => {
                const cardId = card.getAttribute('data-card');
                if (cardId === 'codereview') {
                    vscode.postMessage({ command: 'openCodeReview' });
                } else if (cardId === 'commit') {
                    vscode.postMessage({ command: 'openCommit' });
                } else if (cardId === 'pull') {
                    vscode.postMessage({ command: 'openPull' });
                } else if (cardId === 'novoProjeto') {
                    vscode.postMessage({ command: 'openNovoProjeto' });
                } else if (cardId === 'push') {
                    vscode.postMessage({ command: 'openPush' });
                } else if (cardId === 'pr') {
                    vscode.postMessage({ command: 'openPr' });
                }
            });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Desenvolvimento' });
}
