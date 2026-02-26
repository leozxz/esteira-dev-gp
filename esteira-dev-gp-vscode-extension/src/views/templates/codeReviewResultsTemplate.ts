import { type CodeReviewResult } from '../../models/codeReviewResult';
import { getBaseStyles } from './baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

function scoreColor(score: number): string {
    if (score > 8) { return '#22c55e'; }
    if (score >= 6) { return '#eab308'; }
    return '#ef4444';
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function thermometerCard(label: string, score: number, icon: string, highlight = false): string {
    const color = scoreColor(score);
    const pct = (score / 10) * 100;
    const cardClass = highlight ? 'thermo-card thermo-highlight' : 'thermo-card';

    return `
    <div class="${cardClass}" style="--thermo-color: ${color}">
        <div class="thermo-score">${score.toFixed(1)}</div>
        <div class="thermo-max">/10</div>
        <div class="thermo-track">
            <div class="thermo-fill" style="height:${pct}%"></div>
            <div class="thermo-bulb"></div>
        </div>
        <div class="thermo-icon">${icon}</div>
        <div class="thermo-label">${label}</div>
    </div>`;
}

function progressBar(name: string, score: number): string {
    const color = scoreColor(score);
    const pct = (score / 10) * 100;
    return `
    <div class="breakdown-row">
        <span class="breakdown-name">${escapeHtml(name)}</span>
        <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="breakdown-score" style="color:${color}">${score.toFixed(1)}</span>
    </div>`;
}

export function getCodeReviewResultsHtml(result: CodeReviewResult, accentColor: string): string {
    const nonce = getNonce();
    const csp = buildCsp(nonce);

    const durationSec = Math.round(result.durationMs / 1000);
    const durationStr = durationSec >= 60
        ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
        : `${durationSec}s`;

    const styles = getBaseStyles(accentColor) + `
        .results-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .results-header h1 {
            font-size: 22px;
            margin-bottom: 4px;
        }

        .results-meta {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        /* ── Hero Thermometers ── */
        .hero-scores {
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 16px;
            padding: 28px 16px 24px;
            margin-bottom: 40px;
        }

        .thermo-row {
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
        }

        .thermo-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px 20px;
            border-radius: 12px;
            background: color-mix(in srgb, var(--vscode-foreground) 4%, transparent);
            border: 1px solid color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
            min-width: 120px;
            flex: 1;
            max-width: 180px;
            transition: transform 0.15s ease;
        }

        .thermo-card:hover {
            transform: translateY(-2px);
        }

        .thermo-highlight {
            background: color-mix(in srgb, var(--thermo-color) 8%, transparent);
            border: 2px solid var(--thermo-color);
        }

        .thermo-score {
            font-size: 36px;
            font-weight: 800;
            line-height: 1;
            color: var(--thermo-color);
        }

        .thermo-highlight .thermo-score {
            font-size: 44px;
        }

        .thermo-max {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
        }

        .thermo-track {
            width: 18px;
            height: 100px;
            border-radius: 9px;
            background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            position: relative;
            overflow: hidden;
            margin-bottom: 12px;
        }

        .thermo-highlight .thermo-track {
            height: 120px;
            width: 22px;
            border-radius: 11px;
        }

        .thermo-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            border-radius: inherit;
            background: linear-gradient(to top, var(--thermo-color), color-mix(in srgb, var(--thermo-color) 70%, white));
            transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .thermo-bulb {
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--thermo-color);
            box-shadow: 0 0 12px color-mix(in srgb, var(--thermo-color) 40%, transparent);
        }

        .thermo-highlight .thermo-bulb {
            width: 34px;
            height: 34px;
            bottom: -8px;
            box-shadow: 0 0 20px color-mix(in srgb, var(--thermo-color) 50%, transparent);
        }

        .thermo-icon {
            font-size: 20px;
            margin-bottom: 4px;
        }

        .thermo-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--vscode-descriptionForeground);
        }

        .thermo-highlight .thermo-label {
            font-size: 12px;
            color: var(--thermo-color);
        }

        .section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .breakdown-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }

        .breakdown-name {
            font-size: 12px;
            min-width: 180px;
            flex-shrink: 0;
        }

        .breakdown-bar-track {
            flex: 1;
            height: 8px;
            border-radius: 4px;
            background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            overflow: hidden;
        }

        .breakdown-bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.6s ease;
        }

        .breakdown-score {
            font-size: 13px;
            font-weight: 700;
            min-width: 32px;
            text-align: right;
        }

        .problem-list, .rec-list {
            list-style: none;
            padding: 0;
        }

        .problem-list li, .rec-list li {
            font-size: 13px;
            line-height: 1.6;
            padding: 8px 12px;
            margin-bottom: 6px;
            border-radius: 6px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .problem-list li::before {
            content: '\\26A0  ';
            color: #ef4444;
        }

        .rec-list li::before {
            content: '\\2192  ';
            color: ${accentColor};
        }

        .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 32px;
            flex-wrap: wrap;
        }

        .action-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
        }

        .action-btn:hover { opacity: 0.85; }
        .action-btn:active { transform: scale(0.97); }

        .btn-primary {
            background: ${accentColor};
            color: #fff;
        }

        .btn-secondary {
            background: color-mix(in srgb, ${accentColor} 15%, transparent);
            color: ${accentColor};
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            color: var(--vscode-foreground);
        }

        .copy-feedback {
            display: none;
            font-size: 12px;
            color: #22c55e;
            margin-left: 4px;
        }
    `;

    const qualityBreakdown = result.qualityScores
        .map(s => progressBar(s.name, s.score))
        .join('\n');

    const securityBreakdown = result.securityScores
        .map(s => progressBar(s.name, s.score))
        .join('\n');

    const problemsHtml = result.criticalProblems.length > 0
        ? `<ul class="problem-list">
            ${result.criticalProblems.map(p => `<li>${escapeHtml(p)}</li>`).join('\n')}
        </ul>`
        : '<p style="font-size:13px;color:var(--vscode-descriptionForeground)">Nenhum problema critico encontrado.</p>';

    const recsHtml = result.recommendations.length > 0
        ? `<ul class="rec-list">
            ${result.recommendations.map(r => `<li>${escapeHtml(r)}</li>`).join('\n')}
        </ul>`
        : '<p style="font-size:13px;color:var(--vscode-descriptionForeground)">Nenhuma recomendacao disponivel.</p>';

    const body = `
    <div class="results-header">
        <h1>Code Review Completo</h1>
        <p class="results-meta">${escapeHtml(result.path)} &mdash; ${durationStr}</p>
    </div>

    <div class="hero-scores">
        <div class="thermo-row">
            ${thermometerCard('Qualidade', result.qualityAvg, '&#9889;')}
            ${thermometerCard('Seguranca', result.securityAvg, '&#128737;')}
            ${thermometerCard('Nota Final', result.finalScore, '&#11088;', true)}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Qualidade do Codigo</div>
        ${qualityBreakdown}
    </div>

    <div class="section">
        <div class="section-title">Seguranca</div>
        ${securityBreakdown}
    </div>

    <div class="section">
        <div class="section-title">Top 3 Problemas Criticos</div>
        ${problemsHtml}
    </div>

    <div class="section">
        <div class="section-title">Recomendacoes Prioritarias</div>
        ${recsHtml}
    </div>

    <div class="actions">
        <button class="action-btn btn-primary" id="rerunBtn">Rodar Novamente</button>
        <button class="action-btn btn-secondary" id="copyBtn">
            Copiar Resultado
            <span class="copy-feedback" id="copyFeedback">Copiado!</span>
        </button>
        <button class="action-btn btn-outline" id="backBtn">Voltar</button>
    </div>`;

    const script = `
        const vscode = acquireVsCodeApi();

        document.getElementById('rerunBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'rerunReview' });
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'copyResult' });
            const fb = document.getElementById('copyFeedback');
            fb.style.display = 'inline';
            setTimeout(() => { fb.style.display = 'none'; }, 2000);
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'backToMenu' });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: 'Code Review - Resultados' });
}
