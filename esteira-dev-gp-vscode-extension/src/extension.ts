import * as vscode from 'vscode';
import { EsteiraSidebarProvider } from './views/esteiraPanel';
import { TerminalService } from './services/terminalService';
import { ClaudeRunnerService } from './services/claudeRunnerService';

export function activate(context: vscode.ExtensionContext) {
    const terminalService = new TerminalService();
    const claudeRunner = new ClaudeRunnerService();

    const sidebarProvider = new EsteiraSidebarProvider(
        context.extensionUri,
        context,
        terminalService,
        claudeRunner
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'esteira.sidebarView',
            sidebarProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('esteira.openPanel', () => {
            vscode.commands.executeCommand('esteira.sidebarView.focus');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('esteira.jiraLogin', () => {
            vscode.commands.executeCommand('esteira.sidebarView.focus');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('esteira.jiraLogout', () => {
            vscode.commands.executeCommand('esteira.sidebarView.focus');
        })
    );

    context.subscriptions.push({ dispose: () => terminalService.dispose() });
    context.subscriptions.push(claudeRunner);
}

export function deactivate() {}
