import { getNonce } from './getNonce';

export function buildCsp(nonce: string): string {
    return `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';`;
}

export interface WrapHtmlOptions {
    lang?: string;
    title?: string;
    csp: string;
    styles: string;
    body: string;
    script?: string;
    nonce?: string;
}

export function wrapHtml(options: WrapHtmlOptions): string {
    const lang = options.lang ?? 'pt-BR';
    const title = options.title ?? '';
    const scriptTag = options.script && options.nonce
        ? `\n    <script nonce="${options.nonce}">${options.script}</script>`
        : '';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${options.csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${options.styles}</style>
</head>
<body>
    ${options.body}${scriptTag}
</body>
</html>`;
}

export { getNonce };
