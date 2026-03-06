import { type StageInfo } from '../../data/stages';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

export function getDeployHtml(stage: StageInfo): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const cards: Array<{
        id: string;
        title: string;
        description: string;
        active: boolean;
        icon: string;
        features: Array<{ icon: string; label: string }>;
    }> = [];

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

        document.querySelectorAll('.dev-card-active').forEach(card => {
            card.addEventListener('click', () => {
                const cardId = card.getAttribute('data-card');
                // Future deploy cards
                console.log('Deploy card clicked:', cardId);
            });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Esteira - Deploy' });
}
