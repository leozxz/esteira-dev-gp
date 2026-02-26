import * as vscode from 'vscode';

export class TerminalService {
    private terminals = new Map<string, vscode.Terminal>();

    getOrCreateTerminal(name: string): vscode.Terminal {
        const existing = this.terminals.get(name);
        if (existing && existing.exitStatus === undefined) {
            return existing;
        }
        const terminal = vscode.window.createTerminal(name);
        this.terminals.set(name, terminal);
        return terminal;
    }

    sendCommand(name: string, command: string): void {
        try {
            const terminal = this.getOrCreateTerminal(name);
            terminal.show();
            terminal.sendText(command);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Erro ao executar comando no terminal: ${msg}`);
        }
    }

    dispose(): void {
        for (const terminal of this.terminals.values()) {
            if (terminal.exitStatus === undefined) {
                terminal.dispose();
            }
        }
        this.terminals.clear();
    }
}
