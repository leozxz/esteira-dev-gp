import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn, type ChildProcess } from 'child_process';

export interface ClaudeRunOptions {
    maxTurns?: number;
    timeoutMs?: number;
}

export interface ClaudeRunResult {
    exitCode: number;
    output: string;
    timedOut?: boolean;
}

export class ClaudeRunnerService implements vscode.Disposable {
    private _process: ChildProcess | undefined;
    private _terminal: vscode.Terminal | undefined;
    private _promptFile: string | undefined;
    private _timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    async run(
        prompt: string,
        onData?: (chunk: string, accumulated: string) => void,
        options?: ClaudeRunOptions,
    ): Promise<ClaudeRunResult> {
        this.cancel();

        const maxTurns = options?.maxTurns ?? 25;
        const timeoutMs = options?.timeoutMs ?? 5 * 60 * 1000; // 5 min default

        return new Promise<ClaudeRunResult>((resolve, reject) => {
            let output = '';
            let disposed = false;
            const writeEmitter = new vscode.EventEmitter<string>();
            const closeEmitter = new vscode.EventEmitter<number | void>();

            const startProcess = () => {
                // ── 1. Write prompt to temp file (for debugging) ──
                const promptFile = path.join(
                    os.tmpdir(),
                    `esteira-prompt-${Date.now()}.txt`,
                );
                fs.writeFileSync(promptFile, prompt, 'utf8');
                this._promptFile = promptFile;

                writeEmitter.fire('[Esteira] Prompt salvo em arquivo temporário\r\n');

                // ── 2. Clean environment ──
                const env = { ...process.env };
                delete env['CLAUDECODE'];

                // ── 3. Spawn claude directly (no shell) to avoid expansion of $, `, " in code ──
                const args = [
                    '-p', prompt,
                    '--output-format', 'stream-json',
                    '--max-turns', String(maxTurns),
                    '--verbose',
                ];

                writeEmitter.fire(`[Esteira] Executando: claude -p <prompt> --output-format stream-json --max-turns ${maxTurns}\r\n`);

                const proc = spawn('claude', args, { env });
                this._process = proc;

                writeEmitter.fire(`[Esteira] Processo iniciado (PID ${proc.pid})\r\n`);
                writeEmitter.fire(`[Esteira] Timeout: ${Math.round(timeoutMs / 1000)}s | Max turns: ${maxTurns}\r\n\r\n`);

                // ── 4. Safety timeout ──
                this._timeoutHandle = setTimeout(() => {
                    if (this._process && !this._process.killed) {
                        writeEmitter.fire('\r\n[Esteira] Timeout atingido — encerrando processo.\r\n');
                        this._process.kill('SIGTERM');
                    }
                }, timeoutMs);

                proc.stdout?.on('data', (data: Buffer) => {
                    const text = data.toString();
                    output += text;
                    writeEmitter.fire(text.replace(/\n/g, '\r\n'));
                    onData?.(text, output);
                });

                proc.stderr?.on('data', (data: Buffer) => {
                    const text = data.toString();
                    writeEmitter.fire(`[stderr] ${text.replace(/\n/g, '\r\n')}`);
                    onData?.(text, output);
                });

                proc.on('close', (code) => {
                    if (this._timeoutHandle) { clearTimeout(this._timeoutHandle); this._timeoutHandle = undefined; }
                    this._process = undefined;
                    this._cleanupPromptFile();
                    const exitCode = code ?? 1;
                    if (!disposed) {
                        writeEmitter.fire(`\r\n[Processo finalizado com código ${exitCode}]\r\n`);
                        closeEmitter.fire(exitCode);
                    }
                    resolve({ exitCode, output });
                });

                proc.on('error', (err) => {
                    if (this._timeoutHandle) { clearTimeout(this._timeoutHandle); this._timeoutHandle = undefined; }
                    this._process = undefined;
                    this._cleanupPromptFile();
                    if (!disposed) {
                        writeEmitter.fire(`\r\n[Erro ao iniciar: ${err.message}]\r\n`);
                        writeEmitter.fire('[Verifique se "claude" está instalado e no PATH]\r\n');
                        closeEmitter.fire(1);
                    }
                    reject(err);
                });
            };

            const pty: vscode.Pseudoterminal = {
                onDidWrite: writeEmitter.event,
                onDidClose: closeEmitter.event,
                open: () => startProcess(),
                close: () => {
                    if (!disposed) {
                        disposed = true;
                        this.cancel();
                    }
                },
            };

            this._terminal = vscode.window.createTerminal({
                name: 'Esteira - Code Review',
                pty,
            });
            this._terminal.show();
        });
    }

    cancel(): void {
        if (this._process && !this._process.killed) {
            this._process.kill('SIGTERM');
            this._process = undefined;
        }
        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle);
            this._timeoutHandle = undefined;
        }
        this._cleanupPromptFile();
    }

    dispose(): void {
        this.cancel();
        this._terminal?.dispose();
        this._terminal = undefined;
    }

    private _cleanupPromptFile(): void {
        if (this._promptFile) {
            try { fs.unlinkSync(this._promptFile); } catch { /* ignore */ }
            this._promptFile = undefined;
        }
    }
}
