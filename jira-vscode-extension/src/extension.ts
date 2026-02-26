import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { JiraAuthProvider } from './auth/jiraAuthProvider';
import { TokenManager } from './auth/tokenManager';
import { JiraClient } from './api/jiraClient';
import { IssueTreeProvider } from './views/issueTreeProvider';
import { IssueDetailPanel } from './views/issueDetailPanel';
import { CreateIssuePanel } from './views/createIssuePanel';
import { JiraIssue } from './models/types';

function loadEnvFile(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) { continue; }
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) { continue; }
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file not found — variables must be set via environment
  }
}

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  // Load .env: try extension root first, then user home as fallback
  loadEnvFile(path.join(context.extensionPath, '.env'));
  loadEnvFile(path.join(require('os').homedir(), '.jira-connector.env'));
  // Core services
  const tokenManager = new TokenManager(context.secrets);
  const authProvider = new JiraAuthProvider(tokenManager);
  const jiraClient = new JiraClient(authProvider, tokenManager);
  const treeProvider = new IssueTreeProvider(jiraClient);

  // Register TreeView
  const treeView = vscode.window.createTreeView('jiraIssues', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'jira.login';
  context.subscriptions.push(statusBarItem);

  // Read tracked projects from settings
  function applyTrackedProjects(): void {
    const projects = vscode.workspace.getConfiguration('jira').get<string[]>('trackedProjects', []);
    treeProvider.setTrackedProjects(projects);
  }
  applyTrackedProjects();

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('jira.trackedProjects')) {
        applyTrackedProjects();
        loadIssuesQuietly(treeProvider);
      }
    })
  );

  // Set initial state
  const isLoggedIn = await authProvider.isLoggedIn();
  await updateLoginState(isLoggedIn, tokenManager);

  // If already logged in, load issues
  if (isLoggedIn) {
    loadIssuesQuietly(treeProvider);
  }

  // Auth events
  authProvider.onDidLogin(async () => {
    await updateLoginState(true, tokenManager);
    loadIssuesQuietly(treeProvider);
  });

  authProvider.onDidLogout(async () => {
    await updateLoginState(false, tokenManager);
  });

  // ---- Commands ----

  context.subscriptions.push(
    vscode.commands.registerCommand('jira.login', async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Jira: Aguardando login no browser...',
            cancellable: false,
          },
          async () => {
            await authProvider.login();
          }
        );
        vscode.window.showInformationMessage('Jira: Login realizado com sucesso!');
      } catch (err) {
        if (err instanceof Error && err.message !== 'Login expirou. Tente novamente.') {
          vscode.window.showErrorMessage(`Jira: ${err.message}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jira.logout', async () => {
      await authProvider.logout();
      vscode.window.showInformationMessage('Jira: Desconectado.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jira.refreshIssues', async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Jira: Atualizando issues...',
            cancellable: false,
          },
          async () => {
            await treeProvider.loadIssues();
          }
        );
      } catch (err) {
        vscode.window.showErrorMessage(`Jira: Erro ao atualizar — ${err}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jira.createIssue', async () => {
      await CreateIssuePanel.show(jiraClient, context.extensionUri, () => {
        // Refresh issues after creating
        loadIssuesQuietly(treeProvider);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jira.openIssue', (issue: JiraIssue) => {
      IssueDetailPanel.show(issue, context.extensionUri, jiraClient, () => loadIssuesQuietly(treeProvider));
    })
  );
}

async function updateLoginState(loggedIn: boolean, tokenManager: TokenManager): Promise<void> {
  await vscode.commands.executeCommand('setContext', 'jira.isLoggedIn', loggedIn);

  if (loggedIn) {
    const tokens = await tokenManager.getTokens();
    const label = tokens?.userEmail ?? 'Conectado';
    statusBarItem.text = `$(check) Jira: ${label}`;
    statusBarItem.tooltip = 'Jira — Conectado. Clique para reconectar.';
  } else {
    statusBarItem.text = '$(circle-slash) Jira: Desconectado';
    statusBarItem.tooltip = 'Clique para conectar ao Jira';
  }
  statusBarItem.show();
}

async function loadIssuesQuietly(treeProvider: IssueTreeProvider): Promise<void> {
  try {
    await treeProvider.loadIssues();
  } catch (err) {
    console.error('Jira: Erro ao carregar issues:', err);
  }
}

export function deactivate() {
  // Cleanup handled by disposables
}
