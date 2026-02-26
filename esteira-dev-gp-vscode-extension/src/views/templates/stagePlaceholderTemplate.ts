import { type StageInfo } from '../../data/stages';
import { getBaseStyles } from './baseStyles';
import { buildCsp, wrapHtml } from '../../utils/htmlHelpers';
import { getNonce } from '../../utils/getNonce';

export function getStagePlaceholderHtml(stage: StageInfo): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const styles = getBaseStyles(stage.color) + `
        .content-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            text-align: center;
            border: 2px dashed var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 12px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
        }

        .content-placeholder .icon-large {
            width: 64px;
            height: 64px;
            opacity: 0.3;
            margin-bottom: 16px;
        }

        .content-placeholder .icon-large svg {
            width: 64px;
            height: 64px;
            stroke: var(--vscode-foreground);
        }

        .content-placeholder h2 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .content-placeholder p {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            max-width: 360px;
            line-height: 1.5;
        }

        .badge {
            display: inline-block;
            margin-top: 16px;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            background: color-mix(in srgb, ${stage.color} 20%, transparent);
            color: ${stage.color};
            text-transform: uppercase;
            letter-spacing: 0.5px;
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

    <div class="content-placeholder">
        <div class="icon-large">${stage.icon}</div>
        <h2>Em breve</h2>
        <p>O conteúdo da etapa <strong>${stage.title}</strong> será implementado aqui. Esta área exibirá ferramentas, status e ações específicas desta fase da esteira.</p>
        <span class="badge">Placeholder</span>
    </div>`;

    return wrapHtml({ csp, styles, body, title: `Esteira - ${stage.title}` });
}
