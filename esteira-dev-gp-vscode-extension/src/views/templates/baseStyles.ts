export function getBaseStyles(accentColor: string): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 32px;
        }

        .stage-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .stage-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: color-mix(in srgb, ${accentColor} 15%, transparent);
            padding: 10px;
        }

        .stage-icon svg {
            width: 28px;
            height: 28px;
            stroke: ${accentColor};
        }

        .stage-title h1 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .stage-title p {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }
    `;
}
