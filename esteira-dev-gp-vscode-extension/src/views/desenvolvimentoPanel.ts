import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { spawn, type ChildProcess } from 'child_process';
import { type StageInfo } from '../data/stages';
import { ClaudeRunnerService } from '../services/claudeRunnerService';
import { parseCodeReviewOutput } from '../services/codeReviewParser';
import { GitService } from '../services/gitService';
import { getDesenvolvimentoHtml } from './templates/desenvolvimentoTemplate';
import { getCommitHtml, type CommitViewState } from './templates/commitTemplate';
import { getBaseStyles } from './templates/baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../utils/htmlHelpers';

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export class DesenvolvimentoPanel {
    private _panel: vscode.WebviewPanel | undefined;
    private _stage: StageInfo | undefined;
    private _process: ChildProcess | undefined;
    private _terminal: vscode.Terminal | undefined;
    private _promptFile: string | undefined;
    private _lastReviewPath: string | undefined;
    private _lastReviewContent: string | undefined;
    private _gitService: GitService | undefined;
    private _selectedFolder: string | undefined;

    constructor(private readonly _claudeRunner: ClaudeRunnerService) {}

    open(stage: StageInfo): void {
        this._stage = stage;

        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'esteira.desenvolvimento',
            'Esteira - Desenvolvimento',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true },
        );

        this._panel = panel;
        this._showMenu();

        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'openCodeReview':
                    this._handleCodeReview();
                    break;
                case 'cancelReview':
                    this._cancelProcess();
                    this._showMenu();
                    break;
                case 'rerunReview':
                    if (this._lastReviewPath && this._lastReviewContent) {
                        this._runReview(this._lastReviewPath, this._lastReviewContent);
                    }
                    break;
                case 'copyResult':
                    if (message.text) {
                        vscode.env.clipboard.writeText(message.text);
                        vscode.window.showInformationMessage('Resultado copiado!');
                    }
                    break;
                case 'backToMenu':
                    this._showMenu();
                    break;
                case 'openCommit':
                    this._handleOpenCommit();
                    break;
                case 'switchBranch':
                    this._handleSwitchBranch(message.branch);
                    break;
                case 'createBranch':
                    this._handleCreateBranch(message.branch);
                    break;
                case 'stageFile':
                    this._handleStageFile(message.file);
                    break;
                case 'unstageFile':
                    this._handleUnstageFile(message.file);
                    break;
                case 'stageAll':
                    this._handleStageAll();
                    break;
                case 'unstageAll':
                    this._handleUnstageAll();
                    break;
                case 'commitChanges':
                    this._handleCommit(message.message);
                    break;
                case 'generateCommitMessage':
                    this._handleGenerateCommitMessage();
                    break;
                case 'refreshGitStatus':
                    this._renderCommitView();
                    break;
                case 'selectFolder':
                    this._handleSelectFolder(message.path);
                    break;
                case 'initRepo':
                    this._handleInitRepo();
                    break;
                case 'ghCreateRepo':
                    this._handleGhCreateRepo();
                    break;
                case 'addRemote':
                    this._handleAddRemote(message.url);
                    break;
                case 'ghLogin':
                    this._handleGhLogin();
                    break;
            }
        });

        panel.onDidDispose(() => {
            this._cancelProcess();
            this._panel = undefined;
        });
    }

    private _showMenu(): void {
        if (this._panel && this._stage) {
            this._panel.webview.html = getDesenvolvimentoHtml(this._stage);
        }
    }

    private _cancelProcess(): void {
        if (this._process && !this._process.killed) {
            this._process.kill('SIGTERM');
            this._process = undefined;
        }
        if (this._promptFile) {
            try { fs.unlinkSync(this._promptFile); } catch { /* ignore */ }
            this._promptFile = undefined;
        }
    }

    private async _handleCodeReview(): Promise<void> {
        try {
            const selected = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Selecionar arquivo ou pasta para Code Review',
                title: 'Selecione o arquivo ou pasta para Code Review',
            });

            if (!selected || selected.length === 0) {
                return;
            }

            const fsPath = selected[0].fsPath;
            const stat = fs.statSync(fsPath);

            if (stat.isDirectory()) {
                const files = this._collectCodeFiles(fsPath);
                if (files.length === 0) {
                    vscode.window.showErrorMessage('Nenhum arquivo de código encontrado na pasta.');
                    return;
                }

                let combinedContent = '';
                let totalSize = 0;
                const includedFiles: string[] = [];

                for (const file of files) {
                    const fileStat = fs.statSync(file);
                    if (totalSize + fileStat.size > MAX_FILE_SIZE) { break; }

                    const content = fs.readFileSync(file, 'utf8');
                    if (content.includes('\0')) { continue; }
                    if (content.trim().length === 0) { continue; }

                    const relativePath = path.relative(fsPath, file);
                    combinedContent += `\n// ══════ ${relativePath} ══════\n\n${content}\n`;
                    totalSize += fileStat.size;
                    includedFiles.push(relativePath);
                }

                if (includedFiles.length === 0) {
                    vscode.window.showErrorMessage('Nenhum arquivo válido encontrado na pasta.');
                    return;
                }

                const header = `Pasta: ${fsPath}\nArquivos (${includedFiles.length}): ${includedFiles.join(', ')}`;
                this._runReview(fsPath, header + '\n\n' + combinedContent);
            } else {
                if (stat.size > MAX_FILE_SIZE) {
                    vscode.window.showErrorMessage(
                        `Arquivo muito grande (${(stat.size / 1024).toFixed(0)}KB). Máximo permitido: 500KB.`,
                    );
                    return;
                }
                if (stat.size === 0) {
                    vscode.window.showErrorMessage('O arquivo está vazio.');
                    return;
                }

                const content = fs.readFileSync(fsPath, 'utf8');
                if (content.includes('\0')) {
                    vscode.window.showErrorMessage(
                        'Arquivo binário não suportado. Selecione um arquivo de código-fonte.',
                    );
                    return;
                }

                this._runReview(fsPath, content);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Erro ao iniciar Code Review: ${msg}`);
        }
    }

    private _collectCodeFiles(dirPath: string): string[] {
        const CODE_EXTENSIONS = new Set([
            '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
            '.py', '.java', '.kt', '.go', '.rs', '.rb',
            '.cs', '.cpp', '.c', '.h', '.hpp',
            '.swift', '.m', '.php', '.vue', '.svelte',
            '.sql', '.sh', '.bash', '.zsh',
            '.yaml', '.yml', '.json', '.xml', '.html', '.css', '.scss',
        ]);
        const IGNORE_DIRS = new Set([
            'node_modules', '.git', 'dist', 'build', 'out',
            '.next', '.nuxt', '__pycache__', '.venv', 'vendor',
            'coverage', '.cache', '.turbo',
        ]);

        const results: string[] = [];

        const walk = (dir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
                        walk(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (CODE_EXTENSIONS.has(ext)) {
                        results.push(fullPath);
                    }
                }
            }
        };

        walk(dirPath);
        return results.sort();
    }

    private _runReview(fsPath: string, fileContent: string): void {
        if (!this._panel || !this._stage) { return; }

        this._lastReviewPath = fsPath;
        this._lastReviewContent = fileContent;

        const prompt = this._buildPrompt(fsPath, fileContent);
        const accentColor = this._stage.color;
        const fileName = path.basename(fsPath);

        // Write prompt to temp file (avoids shell expansion of code content)
        const promptFile = path.join(os.tmpdir(), `esteira-review-${Date.now()}.txt`);
        fs.writeFileSync(promptFile, prompt, 'utf8');
        this._promptFile = promptFile;

        // Show loading in webview
        this._panel.webview.html = this._getLoadingHtml(fsPath, accentColor);

        // Clean environment
        const env = { ...process.env };
        delete env['CLAUDECODE'];

        let output = '';
        let disposed = false;
        const writeEmitter = new vscode.EventEmitter<string>();
        const closeEmitter = new vscode.EventEmitter<number | void>();

        const pty: vscode.Pseudoterminal = {
            onDidWrite: writeEmitter.event,
            onDidClose: closeEmitter.event,
            open: () => {
                const escaped = promptFile.replace(/'/g, "'\\''");
                const cmd = `cat '${escaped}' | claude --max-turns 1 --verbose ; rm -f '${escaped}'`;
                const proc = spawn('sh', ['-c', cmd], { env });
                this._process = proc;

                writeEmitter.fire(`[Esteira] Code Review: ${fileName}\r\n\r\n`);

                proc.stdout?.on('data', (data: Buffer) => {
                    const text = data.toString();
                    output += text;
                    writeEmitter.fire(text.replace(/\n/g, '\r\n'));
                });

                proc.stderr?.on('data', (data: Buffer) => {
                    writeEmitter.fire(data.toString().replace(/\n/g, '\r\n'));
                });

                proc.on('close', (code) => {
                    this._process = undefined;
                    this._promptFile = undefined;

                    if (!disposed) {
                        writeEmitter.fire(`\r\n[Finalizado com código ${code ?? 0}]\r\n`);
                        closeEmitter.fire(code ?? 0);
                    }

                    if (this._panel && this._stage && output.trim()) {
                        this._panel.webview.html = this._getResultHtml(
                            output.trim(), fsPath, this._stage.color,
                        );
                    } else if (this._panel) {
                        this._showMenu();
                        vscode.window.showWarningMessage('Code Review não retornou resultado.');
                    }
                });

                proc.on('error', (err) => {
                    this._process = undefined;
                    if (!disposed) {
                        writeEmitter.fire(`\r\n[Erro: ${err.message}]\r\n`);
                        closeEmitter.fire(1);
                    }
                    vscode.window.showErrorMessage(`Erro ao iniciar Code Review: ${err.message}`);
                    if (this._panel) { this._showMenu(); }
                });
            },
            close: () => {
                if (!disposed) {
                    disposed = true;
                    this._cancelProcess();
                }
            },
        };

        if (this._terminal) { this._terminal.dispose(); }
        this._terminal = vscode.window.createTerminal({ name: `Review - ${fileName}`, pty });
        this._terminal.show();
    }

    // ── Commit Handlers ───────────────────────────────────────────

    private _getGitService(folderPath?: string): GitService {
        if (folderPath && (!this._gitService || this._gitService.workspaceRoot !== folderPath)) {
            this._gitService = new GitService(folderPath);
            this._selectedFolder = folderPath;
        }
        if (!this._gitService) {
            this._gitService = new GitService(this._selectedFolder);
        }
        return this._gitService;
    }

    private _getCommitState(error?: string): CommitViewState {
        const git = this._getGitService();
        const isRepo = git.isGitRepo();

        const folders = vscode.workspace.workspaceFolders ?? [];
        const workspaceFolders = folders.map(f => ({ name: f.name, path: f.uri.fsPath }));
        const selectedFolder = git.workspaceRoot;

        let currentBranch = '';
        let branches: string[] = [];
        let files: import('../services/gitService').GitFileStatus[] = [];
        let remoteUrl: string | null = null;

        if (isRepo) {
            try { currentBranch = git.getCurrentBranch(); } catch { /* empty repo */ }
            try { branches = git.getBranches(); } catch { /* empty repo */ }
            try { files = git.getStatus(); } catch { /* empty repo */ }
            try { remoteUrl = git.getRemoteUrl(); } catch { /* no remote */ }
        }

        const gitUser = git.getGitUser();
        let ghUser: string | null = null;
        try {
            if (git.isGhAuthenticated()) {
                ghUser = git.ghGetUser();
            }
        } catch { /* gh not installed or not authenticated */ }

        return {
            currentBranch,
            branches,
            files,
            error,
            gitUser,
            ghUser,
            remoteUrl,
            isGitRepo: isRepo,
            workspaceFolders,
            selectedFolder,
        };
    }

    private _renderCommitView(error?: string): void {
        if (!this._panel) { return; }
        try {
            const state = this._getCommitState(error);
            this._panel.webview.html = getCommitHtml(state);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const folders = vscode.workspace.workspaceFolders ?? [];
            this._panel.webview.html = getCommitHtml({
                currentBranch: '',
                branches: [],
                files: [],
                error: msg,
                gitUser: { name: '', email: '' },
                ghUser: null,
                remoteUrl: null,
                isGitRepo: false,
                workspaceFolders: folders.map(f => ({ name: f.name, path: f.uri.fsPath })),
                selectedFolder: this._selectedFolder ?? (folders[0]?.uri.fsPath ?? ''),
            });
        }
    }

    private _handleOpenCommit(): void {
        this._renderCommitView();
    }

    private _handleSwitchBranch(branch: string): void {
        try {
            this._getGitService().switchBranch(branch);
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleCreateBranch(branch: string): void {
        if (!branch.trim()) { return; }
        try {
            this._getGitService().createBranch(branch.trim());
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleStageFile(file: string): void {
        try {
            this._getGitService().stageFile(file);
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleUnstageFile(file: string): void {
        try {
            this._getGitService().unstageFile(file);
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleStageAll(): void {
        try {
            this._getGitService().stageAll();
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleUnstageAll(): void {
        try {
            this._getGitService().unstageAll();
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleSelectFolder(folderPath: string): void {
        this._gitService = undefined;
        this._getGitService(folderPath);
        this._renderCommitView();
    }

    private _handleInitRepo(): void {
        try {
            this._getGitService().initRepo();
            vscode.window.showInformationMessage('Repositório Git inicializado!');
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private async _handleGhCreateRepo(): Promise<void> {
        const git = this._getGitService();

        if (!git.isGhAuthenticated()) {
            const action = await vscode.window.showWarningMessage(
                'GitHub CLI não está autenticado. Faça login primeiro.',
                'Login no GitHub',
            );
            if (action === 'Login no GitHub') {
                git.ghLogin();
            }
            return;
        }

        const name = await vscode.window.showInputBox({
            prompt: 'Nome do repositório no GitHub',
            placeHolder: 'meu-projeto',
        });
        if (!name) { return; }

        const visibility = await vscode.window.showQuickPick(
            [
                { label: 'Privado', value: true },
                { label: 'Público', value: false },
            ],
            { placeHolder: 'Visibilidade do repositório' },
        );
        if (!visibility) { return; }

        try {
            git.ghCreateRepo(name, visibility.value);
            vscode.window.showInformationMessage(`Repositório "${name}" criado no GitHub!`);
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleAddRemote(url: string): void {
        if (!url.trim()) { return; }
        try {
            this._getGitService().addRemote(url.trim());
            vscode.window.showInformationMessage('Remote origin vinculado!');
            this._renderCommitView();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private _handleGhLogin(): void {
        this._getGitService().ghLogin();
    }

    private _handleCommit(message: string): void {
        try {
            this._getGitService().commit(message);
            vscode.window.showInformationMessage('Commit realizado com sucesso!');
            this._showMenu();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._renderCommitView(msg);
        }
    }

    private async _handleGenerateCommitMessage(): Promise<void> {
        if (!this._panel) { return; }
        try {
            const diff = this._getGitService().getDiffCached();
            if (!diff.trim()) {
                this._panel.webview.postMessage({
                    command: 'aiError',
                    error: 'Nenhum arquivo staged para gerar mensagem.',
                });
                vscode.window.showWarningMessage('Faça stage de arquivos antes de gerar a mensagem.');
                return;
            }

            const prompt = `Analise o diff abaixo e gere uma mensagem de commit semântica em português seguindo o padrão Conventional Commits (feat:, fix:, refactor:, docs:, style:, test:, chore:).

A mensagem deve ter:
- Linha 1: tipo(escopo): descrição curta (max 72 chars)
- Linha 3+: corpo explicando O QUE mudou e POR QUÊ (se necessário)

Responda APENAS com a mensagem de commit, sem explicações adicionais, sem markdown, sem code blocks.

\`\`\`diff
${diff}
\`\`\``;

            const result = await this._claudeRunner.run(prompt, undefined, {
                maxTurns: 1,
                timeoutMs: 30000,
            });

            if (this._panel && result.output.trim()) {
                // Extract text content from stream-json output
                const commitMsg = this._extractTextFromStreamJson(result.output);
                this._panel.webview.postMessage({
                    command: 'setCommitMessage',
                    message: commitMsg,
                });
            } else {
                this._panel?.webview.postMessage({ command: 'aiError' });
                vscode.window.showWarningMessage('IA não retornou uma mensagem de commit.');
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this._panel?.webview.postMessage({ command: 'aiError', error: msg });
            vscode.window.showErrorMessage(`Erro ao gerar mensagem: ${msg}`);
        }
    }

    private _extractTextFromStreamJson(raw: string): string {
        // stream-json format has JSON lines; extract text from "result" or "content" messages
        const lines = raw.split('\n').filter(l => l.trim());
        let text = '';
        for (const line of lines) {
            try {
                const obj = JSON.parse(line);
                // Handle different stream-json message types
                if (obj.type === 'result' && obj.result) {
                    // Final result message
                    text = obj.result;
                    break;
                }
                if (obj.type === 'assistant' && obj.message?.content) {
                    for (const block of obj.message.content) {
                        if (block.type === 'text') {
                            text += block.text;
                        }
                    }
                }
                if (obj.type === 'content_block_delta' && obj.delta?.text) {
                    text += obj.delta.text;
                }
            } catch {
                // Not JSON, might be plain text
                if (!line.startsWith('{')) {
                    text += line + '\n';
                }
            }
        }
        return text.trim() || raw.trim();
    }

    // ── HTML Templates ─────────────────────────────────────────────

    private _getLoadingHtml(filePath: string, accentColor: string): string {
        const nonce = getNonce();
        const csp = buildCsp(nonce);
        const fileName = path.basename(filePath);

        const styles = getBaseStyles(accentColor) + `
            .loading-container {
                max-width: 520px;
                margin: 80px auto;
                text-align: center;
            }
            .spinner {
                width: 48px; height: 48px;
                border: 4px solid color-mix(in srgb, ${accentColor} 20%, transparent);
                border-top-color: ${accentColor};
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto 24px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h2 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
            .subtitle {
                font-size: 13px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 8px;
            }
            .file-path {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                font-family: var(--vscode-editor-font-family, monospace);
                opacity: 0.7;
                word-break: break-all;
                margin-bottom: 24px;
            }
            .timer {
                font-size: 28px;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                color: ${accentColor};
                font-family: var(--vscode-editor-font-family, monospace);
                margin-bottom: 24px;
            }
            .hint {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                opacity: 0.6;
                margin-bottom: 24px;
            }
            .cancel-btn {
                padding: 8px 28px;
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
                border-radius: 6px;
                background: transparent;
                color: var(--vscode-foreground);
                font-size: 12px; font-weight: 500;
                cursor: pointer; font-family: inherit;
            }
            .cancel-btn:hover {
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            }
        `;

        const body = `
        <div class="loading-container">
            <div class="spinner"></div>
            <h2>Code Review em Andamento</h2>
            <div class="subtitle">Analisando: ${escapeHtml(fileName)}</div>
            <div class="file-path">${escapeHtml(filePath)}</div>
            <div class="timer" id="timer">00:00</div>
            <div class="hint">Acompanhe o output no terminal aberto ao lado</div>
            <button class="cancel-btn" id="cancelBtn">Cancelar</button>
        </div>`;

        const script = `
            const vscode = acquireVsCodeApi();
            const start = Date.now();
            setInterval(() => {
                const s = Math.floor((Date.now() - start) / 1000);
                document.getElementById('timer').textContent =
                    String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
            }, 1000);
            document.getElementById('cancelBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'cancelReview' });
            });
        `;

        return wrapHtml({ csp, styles, body, script, nonce, title: 'Code Review - Analisando...' });
    }

    private _getResultHtml(markdown: string, filePath: string, accentColor: string): string {
        const nonce = getNonce();
        const csp = buildCsp(nonce);
        const fileName = path.basename(filePath);
        const escapedMarkdown = escapeHtml(markdown);

        // Parse scores from output
        const parsed = parseCodeReviewOutput(markdown, filePath, 0);

        function scoreColor(s: number): string {
            if (s > 8) { return '#22c55e'; }
            if (s >= 6) { return '#eab308'; }
            return '#ef4444';
        }

        const qColor = scoreColor(parsed.qualityAvg);
        const sColor = scoreColor(parsed.securityAvg);
        const fColor = scoreColor(parsed.finalScore);

        const styles = getBaseStyles(accentColor) + `
            .result-container { max-width: 820px; margin: 0 auto; }

            /* ── Score Hero ── */
            .score-hero {
                border-radius: 16px;
                padding: 32px 24px 28px;
                margin-bottom: 32px;
                background: var(--vscode-sideBar-background, var(--vscode-editor-background));
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }

            .score-hero-title {
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 28px;
            }

            .score-cards {
                display: flex;
                justify-content: center;
                gap: 16px;
                flex-wrap: wrap;
            }

            .score-card {
                flex: 1;
                max-width: 220px;
                min-width: 140px;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 16px 18px;
                border-radius: 14px;
                background: color-mix(in srgb, var(--vscode-foreground) 3%, transparent);
                border: 1px solid color-mix(in srgb, var(--vscode-foreground) 8%, transparent);
                position: relative;
                overflow: hidden;
            }

            .score-card--main {
                border: 2px solid var(--card-color);
                background: color-mix(in srgb, var(--card-color) 6%, transparent);
                max-width: 240px;
                padding: 24px 20px 20px;
            }

            .score-card__icon {
                font-size: 22px;
                margin-bottom: 6px;
            }

            .score-card__value {
                font-size: 42px;
                font-weight: 900;
                line-height: 1;
                color: var(--card-color);
                font-variant-numeric: tabular-nums;
            }

            .score-card--main .score-card__value {
                font-size: 54px;
            }

            .score-card__of {
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 14px;
            }

            /* Thermometer bar */
            .thermo {
                width: 100%;
                height: 10px;
                border-radius: 5px;
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
                overflow: hidden;
                margin-bottom: 14px;
            }

            .score-card--main .thermo {
                height: 14px;
                border-radius: 7px;
            }

            .thermo__fill {
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, color-mix(in srgb, var(--card-color) 60%, transparent), var(--card-color));
                transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
                box-shadow: 0 0 8px color-mix(in srgb, var(--card-color) 40%, transparent);
            }

            .score-card__label {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                color: var(--vscode-descriptionForeground);
            }

            .score-card--main .score-card__label {
                font-size: 12px;
                color: var(--card-color);
            }

            /* ── Header ── */
            .result-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 24px; padding-bottom: 16px;
                border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .result-header h2 { font-size: 18px; font-weight: 600; }
            .header-actions { display: flex; gap: 8px; }

            .btn {
                padding: 6px 16px; border-radius: 6px; font-size: 12px;
                font-weight: 500; cursor: pointer; font-family: inherit; border: none;
            }
            .btn-primary { background: ${accentColor}; color: #fff; }
            .btn-primary:hover { opacity: 0.85; }
            .btn-secondary {
                background: transparent; color: var(--vscode-foreground);
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .btn-secondary:hover {
                background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
            }

            /* ── Markdown ── */
            .md-content { line-height: 1.7; font-size: 13px; }
            .md-content h1 {
                font-size: 20px; font-weight: 700; margin: 28px 0 12px;
                color: ${accentColor};
                border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
                padding-bottom: 8px;
            }
            .md-content h2 { font-size: 16px; font-weight: 600; margin: 24px 0 10px; color: ${accentColor}; }
            .md-content h3 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; }
            .md-content p { margin: 6px 0; }
            .md-content strong { color: var(--vscode-foreground); }
            .md-content ul, .md-content ol { margin: 8px 0; padding-left: 24px; }
            .md-content li { margin: 4px 0; }
            .md-content table {
                width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;
            }
            .md-content th, .md-content td {
                padding: 8px 12px; text-align: left;
                border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            }
            .md-content th {
                background: color-mix(in srgb, ${accentColor} 10%, transparent); font-weight: 600;
            }
            .md-content tr:nth-child(even) td {
                background: color-mix(in srgb, var(--vscode-foreground) 3%, transparent);
            }
            .md-content code {
                font-family: var(--vscode-editor-font-family, monospace); font-size: 12px;
                background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
                padding: 2px 5px; border-radius: 3px;
            }
            .md-content pre {
                background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.15));
                padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0;
            }
            .md-content pre code { background: none; padding: 0; }
            .md-content hr {
                border: none; height: 1px; margin: 20px 0;
                background: var(--vscode-panel-border, var(--vscode-widget-border));
            }
        `;

        const body = `
        <div class="result-container">
            <!-- Score Hero -->
            <div class="score-hero">
                <div class="score-hero-title">Resultado do Code Review</div>
                <div class="score-cards">
                    <div class="score-card" style="--card-color: ${qColor}">
                        <div class="score-card__value">${parsed.qualityAvg.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${parsed.qualityAvg * 10}%"></div></div>
                        <div class="score-card__label">Qualidade</div>
                    </div>
                    <div class="score-card" style="--card-color: ${sColor}">
                        <div class="score-card__value">${parsed.securityAvg.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${parsed.securityAvg * 10}%"></div></div>
                        <div class="score-card__label">Seguran&#231;a</div>
                    </div>
                    <div class="score-card score-card--main" style="--card-color: ${fColor}">
                        <div class="score-card__value">${parsed.finalScore.toFixed(1)}</div>
                        <div class="score-card__of">/10</div>
                        <div class="thermo"><div class="thermo__fill" style="width:${parsed.finalScore * 10}%"></div></div>
                        <div class="score-card__label">Nota Final</div>
                    </div>
                </div>
            </div>

            <!-- Header + Actions -->
            <div class="result-header">
                <h2>${escapeHtml(fileName)}</h2>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="rerunBtn">Rodar Novamente</button>
                    <button class="btn btn-secondary" id="copyBtn">Copiar</button>
                    <button class="btn btn-primary" id="backBtn">Voltar ao Menu</button>
                </div>
            </div>

            <!-- Markdown Content -->
            <div class="md-content" id="mdContent"></div>
        </div>
        <script type="text/plain" id="rawMarkdown">${escapedMarkdown}</script>`;

        const script = `
            const vscode = acquireVsCodeApi();
            const rawMd = document.getElementById('rawMarkdown').textContent;
            document.getElementById('mdContent').innerHTML = renderMarkdown(rawMd);

            document.getElementById('backBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'backToMenu' });
            });
            document.getElementById('copyBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'copyResult', text: rawMd });
            });
            document.getElementById('rerunBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'rerunReview' });
            });

            function renderMarkdown(md) {
                var lines = md.split('\\n');
                var html = '';
                var inTable = false;
                var tableRowIdx = 0;
                var inCodeBlock = false;
                var codeBlockContent = '';
                var inUl = false;
                var inOl = false;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if (line.trim().indexOf('\`\`\`') === 0) {
                        if (inCodeBlock) {
                            html += '<pre><code>' + esc(codeBlockContent) + '</code></pre>';
                            codeBlockContent = '';
                            inCodeBlock = false;
                        } else {
                            inCodeBlock = true;
                        }
                        continue;
                    }
                    if (inCodeBlock) {
                        codeBlockContent += (codeBlockContent ? '\\n' : '') + line;
                        continue;
                    }

                    if (inUl && !/^\\s*[-*] /.test(line)) { html += '</ul>'; inUl = false; }
                    if (inOl && !/^\\s*\\d+\\. /.test(line)) { html += '</ol>'; inOl = false; }

                    if (line.trim().indexOf('|') === 0 && line.trim().lastIndexOf('|') === line.trim().length - 1) {
                        if (/^\\|[\\s:\\-|]+\\|$/.test(line.trim())) continue;
                        if (!inTable) { html += '<table>'; inTable = true; tableRowIdx = 0; }
                        var cells = line.split('|').slice(1, -1);
                        var tag = tableRowIdx === 0 ? 'th' : 'td';
                        html += '<tr>' + cells.map(function(c) { return '<' + tag + '>' + inline(c.trim()) + '</' + tag + '>'; }).join('') + '</tr>';
                        tableRowIdx++;
                        continue;
                    }
                    if (inTable) { html += '</table>'; inTable = false; }

                    var hMatch = line.match(/^(#{1,3}) (.+)$/);
                    if (hMatch) {
                        var level = hMatch[1].length;
                        html += '<h' + level + '>' + inline(hMatch[2]) + '</h' + level + '>';
                        continue;
                    }

                    if (/^---+$/.test(line.trim())) { html += '<hr>'; continue; }

                    var ulMatch = line.match(/^\\s*[-*] (.+)$/);
                    if (ulMatch) {
                        if (!inUl) { html += '<ul>'; inUl = true; }
                        html += '<li>' + inline(ulMatch[1]) + '</li>';
                        continue;
                    }

                    var olMatch = line.match(/^\\s*\\d+\\. (.+)$/);
                    if (olMatch) {
                        if (!inOl) { html += '<ol>'; inOl = true; }
                        html += '<li>' + inline(olMatch[1]) + '</li>';
                        continue;
                    }

                    if (!line.trim()) { html += '<br>'; continue; }
                    html += '<p>' + inline(line) + '</p>';
                }

                if (inTable) html += '</table>';
                if (inUl) html += '</ul>';
                if (inOl) html += '</ol>';
                return html;
            }

            function inline(text) {
                return esc(text)
                    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\`(.+?)\`/g, '<code>$1</code>');
            }

            function esc(text) {
                var d = document.createElement('div');
                d.textContent = text;
                return d.innerHTML;
            }
        `;

        return wrapHtml({ csp, styles, body, script, nonce, title: 'Code Review - Resultado' });
    }

    // ── Prompt ──────────────────────────────────────────────────────

    private _buildPrompt(filePath: string, fileContent: string): string {
        const ext = filePath.split('.').pop() ?? '';
        return `Faça um Code Review completo e uma Análise de Segurança do arquivo abaixo.

## ARQUIVO: ${filePath}

\`\`\`${ext}
${fileContent}
\`\`\`

## INSTRUÇÕES
- NÃO use nenhuma ferramenta. O conteúdo do arquivo já está acima.
- Analise APENAS o código fornecido acima.
- Responda diretamente com a análise.

## PARTE 1 - CODE REVIEW (Qualidade do Código)
Avalie cada critério de 0 a 10 e justifique:

1. **Clean Code & Legibilidade** - Nomes claros, funções pequenas, código auto-documentado
2. **Princípios SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
3. **DRY & Reutilização** - Código duplicado, abstrações adequadas
4. **Tratamento de Erros** - Try/catch, error boundaries, mensagens claras
5. **Performance** - Complexidade algorítmica, memory leaks, otimizações
6. **Testabilidade** - Código testável, separation of concerns, injeção de dependências
7. **Arquitetura & Padrões** - Design patterns, organização de pastas, modularidade

## PARTE 2 - SECURITY REVIEW (Análise de Segurança)
Avalie cada critério de 0 a 10 e justifique:

1. **Injection (SQL/NoSQL/Command)** - Inputs sanitizados, prepared statements, validação
2. **XSS (Cross-Site Scripting)** - Escape de output, Content Security Policy
3. **Autenticação & Autorização** - Tokens seguros, sessões, RBAC, JWT
4. **Dados Sensíveis** - Secrets hardcoded, .env expostos, logs com dados sensíveis
5. **Dependências** - Pacotes vulneráveis, versões desatualizadas
6. **OWASP Top 10** - Verificação geral das 10 vulnerabilidades mais críticas
7. **Configuração de Segurança** - CORS, headers HTTP, HTTPS, rate limiting

## FORMATO DE SAÍDA

Para cada item, use este formato:
- **Critério**: [Nota]/10 - [Justificativa breve com exemplos do código]

### RESUMO FINAL

| Categoria | Nota |
|-----------|------|
| Clean Code & Legibilidade | X/10 |
| SOLID | X/10 |
| DRY & Reutilização | X/10 |
| Tratamento de Erros | X/10 |
| Performance | X/10 |
| Testabilidade | X/10 |
| Arquitetura & Padrões | X/10 |
| Injection | X/10 |
| XSS | X/10 |
| Auth & Autorização | X/10 |
| Dados Sensíveis | X/10 |
| Dependências | X/10 |
| OWASP Top 10 | X/10 |
| Config Segurança | X/10 |

**NOTA GERAL DE QUALIDADE**: X.X/10 (média das notas de Code Review)
**NOTA GERAL DE SEGURANÇA**: X.X/10 (média das notas de Security Review)
**NOTA FINAL**: X.X/10 (média ponderada: 40% qualidade + 60% segurança)

### TOP 3 PROBLEMAS CRÍTICOS
Liste os 3 problemas mais urgentes encontrados.

### RECOMENDAÇÕES PRIORITÁRIAS
Liste as 5 ações mais importantes para melhorar o código.`;
    }
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
