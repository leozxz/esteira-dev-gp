import * as vscode from 'vscode';
import { JiraClient } from '../api/jiraClient';
import { JiraIssue } from '../models/types';

interface WebviewMessage {
  command: string;
  transitionId?: string;
  priorityId?: string;
  accountId?: string | null;
}

export class IssueDetailPanel {
  private static panels = new Map<string, IssueDetailPanel>();
  private panel: vscode.WebviewPanel;
  private disposed = false;

  static show(
    issue: JiraIssue,
    extensionUri: vscode.Uri,
    jiraClient: JiraClient,
    onUpdated: () => void
  ): IssueDetailPanel {
    const existing = IssueDetailPanel.panels.get(issue.key);
    if (existing && !existing.disposed) {
      existing.panel.reveal();
      existing.update(issue);
      return existing;
    }

    const instance = new IssueDetailPanel(issue, extensionUri, jiraClient, onUpdated);
    IssueDetailPanel.panels.set(issue.key, instance);
    return instance;
  }

  private constructor(
    private issue: JiraIssue,
    private extensionUri: vscode.Uri,
    private jiraClient: JiraClient,
    private onUpdated: () => void
  ) {
    this.panel = vscode.window.createWebviewPanel(
      'jiraIssueDetail',
      `${issue.key}: ${issue.fields.summary}`,
      vscode.ViewColumn.One,
      { enableScripts: true, localResourceRoots: [extensionUri] }
    );

    this.panel.iconPath = new vscode.ThemeIcon('issue-opened');
    this.panel.webview.html = this.getHtml(issue);

    this.panel.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this.handleMessage(msg)
    );

    this.panel.onDidDispose(() => {
      this.disposed = true;
      IssueDetailPanel.panels.delete(issue.key);
    });
  }

  update(issue: JiraIssue): void {
    this.issue = issue;
    this.panel.webview.html = this.getHtml(issue);
  }

  private async handleMessage(msg: WebviewMessage): Promise<void> {
    switch (msg.command) {
      case 'loadTransitions': {
        try {
          const transitions = await this.jiraClient.getTransitions(this.issue.key);
          this.panel.webview.postMessage({
            command: 'transitionsLoaded',
            transitions: transitions.map((t) => ({ id: t.id, name: t.name })),
          });
        } catch (err) {
          this.postError(`Erro ao carregar transições: ${err instanceof Error ? err.message : err}`);
        }
        break;
      }

      case 'loadPriorities': {
        try {
          const priorities = await this.jiraClient.getPriorities();
          this.panel.webview.postMessage({
            command: 'prioritiesLoaded',
            priorities: priorities.map((p) => ({ id: p.id, name: p.name })),
          });
        } catch (err) {
          this.postError(`Erro ao carregar prioridades: ${err instanceof Error ? err.message : err}`);
        }
        break;
      }

      case 'loadAssignableUsers': {
        try {
          const users = await this.jiraClient.getAssignableUsers(this.issue.fields.project.key);
          this.panel.webview.postMessage({
            command: 'assignableUsersLoaded',
            users: users.map((u) => ({ accountId: u.accountId, displayName: u.displayName })),
          });
        } catch (err) {
          this.postError(`Erro ao carregar usuários: ${err instanceof Error ? err.message : err}`);
        }
        break;
      }

      case 'updateStatus': {
        if (!msg.transitionId) { return; }
        try {
          this.panel.webview.postMessage({ command: 'updating', field: 'status' });
          await this.jiraClient.transitionIssue(this.issue.key, msg.transitionId);
          await this.refreshIssue();
        } catch (err) {
          this.postError(`Erro ao atualizar status: ${err instanceof Error ? err.message : err}`);
          this.panel.webview.postMessage({ command: 'updateDone' });
        }
        break;
      }

      case 'updatePriority': {
        if (!msg.priorityId) { return; }
        try {
          this.panel.webview.postMessage({ command: 'updating', field: 'priority' });
          await this.jiraClient.updateIssue(this.issue.key, { priority: { id: msg.priorityId } });
          await this.refreshIssue();
        } catch (err) {
          this.postError(`Erro ao atualizar prioridade: ${err instanceof Error ? err.message : err}`);
          this.panel.webview.postMessage({ command: 'updateDone' });
        }
        break;
      }

      case 'updateAssignee': {
        try {
          this.panel.webview.postMessage({ command: 'updating', field: 'assignee' });
          const assignee = msg.accountId ? { accountId: msg.accountId } : null;
          await this.jiraClient.updateIssue(this.issue.key, { assignee });
          await this.refreshIssue();
        } catch (err) {
          this.postError(`Erro ao atualizar responsável: ${err instanceof Error ? err.message : err}`);
          this.panel.webview.postMessage({ command: 'updateDone' });
        }
        break;
      }
    }
  }

  private async refreshIssue(): Promise<void> {
    try {
      this.issue = await this.jiraClient.getIssue(this.issue.key);
      this.panel.webview.html = this.getHtml(this.issue);
      this.onUpdated();
    } catch (err) {
      this.postError(`Erro ao recarregar issue: ${err instanceof Error ? err.message : err}`);
    }
  }

  private postError(message: string): void {
    this.panel.webview.postMessage({ command: 'error', message });
  }

  private getHtml(issue: JiraIssue): string {
    const nonce = getNonce();
    const f = issue.fields;
    const description = this.renderDescription(f.description);
    const statusColor = this.getStatusColor(f.status.statusCategory.key);
    const priorityEmoji = this.getPriorityEmoji(f.priority.name);
    const createdDate = new Date(f.created).toLocaleDateString('pt-BR');
    const updatedDate = new Date(f.updated).toLocaleDateString('pt-BR');
    const labels = f.labels.length > 0
      ? f.labels.map((l) => `<span class="label">${this.escapeHtml(l)}</span>`).join(' ')
      : '<span class="muted">Nenhuma</span>';

    const assigneeName = f.assignee
      ? this.escapeHtml(f.assignee.displayName)
      : '<span class="muted">Não atribuído</span>';

    return /* html */ `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 1.4em; margin-bottom: 4px; }
    .key { color: var(--vscode-textLink-foreground); font-size: 0.9em; }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
      padding: 12px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
    }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 0.75em; text-transform: uppercase; color: var(--vscode-descriptionForeground); margin-bottom: 2px; }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.85em;
      font-weight: 600;
      color: white;
    }
    .description {
      margin-top: 16px;
      padding: 12px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 6px;
      white-space: pre-wrap;
    }
    .label {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 0.8em;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      margin-right: 4px;
    }
    .muted { color: var(--vscode-descriptionForeground); }
    hr { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 16px 0; }

    /* Editable fields */
    .editable {
      cursor: pointer;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .editable .edit-icon {
      opacity: 0;
      font-size: 0.75em;
      transition: opacity 0.15s;
    }
    .editable:hover .edit-icon {
      opacity: 0.7;
    }
    .editable:hover {
      text-decoration: underline;
      text-decoration-style: dotted;
    }

    .inline-select {
      padding: 4px 6px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-family: var(--vscode-font-family);
      font-size: 0.9em;
      max-width: 220px;
    }
    .inline-select:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }

    .updating-text {
      font-style: italic;
      opacity: 0.7;
      font-size: 0.85em;
    }

    .error-banner {
      display: none;
      background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      color: var(--vscode-errorForeground, #f48771);
      padding: 10px 14px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 0.9em;
      word-break: break-word;
    }
    .error-banner.visible { display: block; }
  </style>
</head>
<body>
  <div id="errorBanner" class="error-banner"></div>
  <div class="key">${this.escapeHtml(issue.key)}</div>
  <h1>${this.escapeHtml(f.summary)}</h1>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Status</span>
      <span id="statusField">
        <span class="editable" id="editStatusBtn">
          <span class="status-badge" style="background:${statusColor}">${this.escapeHtml(f.status.name)}</span>
          <span class="edit-icon">\u270E</span>
        </span>
      </span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Prioridade</span>
      <span id="priorityField">
        <span class="editable" id="editPriorityBtn">
          <span>${priorityEmoji} ${this.escapeHtml(f.priority.name)}</span>
          <span class="edit-icon">\u270E</span>
        </span>
      </span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Tipo</span>
      <span>${this.escapeHtml(f.issuetype.name)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Responsável</span>
      <span id="assigneeField">
        <span class="editable" id="editAssigneeBtn">
          <span>${assigneeName}</span>
          <span class="edit-icon">\u270E</span>
        </span>
      </span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Projeto</span>
      <span>${this.escapeHtml(f.project.name)} (${this.escapeHtml(f.project.key)})</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Labels</span>
      <span>${labels}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Criado</span>
      <span>${createdDate}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Atualizado</span>
      <span>${updatedDate}</span>
    </div>
  </div>

  <hr>
  <h2>Descrição</h2>
  <div class="description">${description || '<span class="muted">Sem descrição</span>'}</div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const errorBanner = document.getElementById('errorBanner');

    function showError(message) {
      errorBanner.textContent = message;
      errorBanner.classList.add('visible');
      setTimeout(() => { errorBanner.classList.remove('visible'); }, 8000);
    }

    function hideError() {
      errorBanner.classList.remove('visible');
      errorBanner.textContent = '';
    }

    function setUpdating(fieldId) {
      const el = document.getElementById(fieldId);
      if (el) { el.innerHTML = '<span class="updating-text">Atualizando...</span>'; }
    }

    // --- Status ---
    function editStatus() {
      hideError();
      const field = document.getElementById('statusField');
      field.innerHTML = '<span class="updating-text">Carregando...</span>';
      vscode.postMessage({ command: 'loadTransitions' });
    }

    // --- Priority ---
    function editPriority() {
      hideError();
      const field = document.getElementById('priorityField');
      field.innerHTML = '<span class="updating-text">Carregando...</span>';
      vscode.postMessage({ command: 'loadPriorities' });
    }

    // --- Assignee ---
    function editAssignee() {
      hideError();
      const field = document.getElementById('assigneeField');
      field.innerHTML = '<span class="updating-text">Carregando...</span>';
      vscode.postMessage({ command: 'loadAssignableUsers' });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;

      if (msg.command === 'transitionsLoaded') {
        const field = document.getElementById('statusField');
        if (!msg.transitions || msg.transitions.length === 0) {
          field.innerHTML = '<span class="muted">Nenhuma transição disponível</span>';
          return;
        }
        const options = msg.transitions.map(
          t => '<option value="' + t.id + '">' + t.name + '</option>'
        ).join('');
        field.innerHTML =
          '<select class="inline-select" id="statusSelect">' +
          '<option value="">Selecione...</option>' + options +
          '</select>';
        const statusSel = document.getElementById('statusSelect');
        statusSel.addEventListener('change', onStatusChange);
        statusSel.focus();
      }

      if (msg.command === 'prioritiesLoaded') {
        const field = document.getElementById('priorityField');
        const options = msg.priorities.map(
          p => '<option value="' + p.id + '">' + p.name + '</option>'
        ).join('');
        field.innerHTML =
          '<select class="inline-select" id="prioritySelect">' +
          '<option value="">Selecione...</option>' + options +
          '</select>';
        const prioritySel = document.getElementById('prioritySelect');
        prioritySel.addEventListener('change', onPriorityChange);
        prioritySel.focus();
      }

      if (msg.command === 'assignableUsersLoaded') {
        const field = document.getElementById('assigneeField');
        const options = msg.users.map(
          u => '<option value="' + u.accountId + '">' + u.displayName + '</option>'
        ).join('');
        field.innerHTML =
          '<select class="inline-select" id="assigneeSelect">' +
          '<option value="">Selecione...</option>' +
          '<option value="__unassigned__">Não atribuído</option>' +
          options +
          '</select>';
        const assigneeSel = document.getElementById('assigneeSelect');
        assigneeSel.addEventListener('change', onAssigneeChange);
        assigneeSel.focus();
      }

      if (msg.command === 'updating') {
        if (msg.field === 'status') { setUpdating('statusField'); }
        if (msg.field === 'priority') { setUpdating('priorityField'); }
        if (msg.field === 'assignee') { setUpdating('assigneeField'); }
      }

      if (msg.command === 'error') {
        showError(msg.message);
      }
    });

    function onStatusChange() {
      const sel = document.getElementById('statusSelect');
      if (sel.value) {
        vscode.postMessage({ command: 'updateStatus', transitionId: sel.value });
      }
    }

    function onPriorityChange() {
      const sel = document.getElementById('prioritySelect');
      if (sel.value) {
        vscode.postMessage({ command: 'updatePriority', priorityId: sel.value });
      }
    }

    function onAssigneeChange() {
      const sel = document.getElementById('assigneeSelect');
      if (sel.value) {
        const accountId = sel.value === '__unassigned__' ? null : sel.value;
        vscode.postMessage({ command: 'updateAssignee', accountId: accountId });
      }
    }

    // Attach event listeners (inline onclick/onchange is blocked by CSP)
    document.getElementById('editStatusBtn').addEventListener('click', editStatus);
    document.getElementById('editPriorityBtn').addEventListener('click', editPriority);
    document.getElementById('editAssigneeBtn').addEventListener('click', editAssignee);
  </script>
</body>
</html>`;
  }

  private renderDescription(description: unknown): string {
    if (!description || typeof description !== 'object') {
      return '';
    }

    // ADF (Atlassian Document Format) — basic rendering
    const doc = description as { content?: Array<{ type: string; content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }> }> };
    if (!doc.content) {
      return '';
    }

    const lines: string[] = [];
    for (const block of doc.content) {
      if (block.type === 'paragraph' && block.content) {
        const text = block.content
          .map((node) => {
            if (node.type === 'text' && node.text) {
              let t = this.escapeHtml(node.text);
              if (node.marks) {
                for (const mark of node.marks) {
                  if (mark.type === 'strong') { t = `<strong>${t}</strong>`; }
                  if (mark.type === 'em') { t = `<em>${t}</em>`; }
                  if (mark.type === 'code') { t = `<code>${t}</code>`; }
                }
              }
              return t;
            }
            return '';
          })
          .join('');
        lines.push(`<p>${text}</p>`);
      } else if (block.type === 'heading' && block.content) {
        const text = block.content.map((n) => n.text ? this.escapeHtml(n.text) : '').join('');
        lines.push(`<h3>${text}</h3>`);
      } else if (block.type === 'bulletList' || block.type === 'orderedList') {
        const tag = block.type === 'bulletList' ? 'ul' : 'ol';
        const items = (block as unknown as { content: Array<{ content?: Array<{ content?: Array<{ text?: string }> }> }> }).content;
        const lis = items
          .map((item) => {
            const text = item.content
              ?.flatMap((p) => p.content?.map((n) => n.text ? this.escapeHtml(n.text) : '') ?? [])
              .join('') ?? '';
            return `<li>${text}</li>`;
          })
          .join('');
        lines.push(`<${tag}>${lis}</${tag}>`);
      } else if (block.type === 'codeBlock' && block.content) {
        const code = block.content.map((n) => n.text ? this.escapeHtml(n.text) : '').join('');
        lines.push(`<pre><code>${code}</code></pre>`);
      }
    }

    return lines.join('\n');
  }

  private getStatusColor(categoryKey: string): string {
    switch (categoryKey) {
      case 'done': return '#36B37E';
      case 'indeterminate': return '#0065FF';
      case 'new': return '#6B778C';
      default: return '#6B778C';
    }
  }

  private getPriorityEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('highest') || lower.includes('critical')) { return '🔴'; }
    if (lower.includes('high')) { return '🟠'; }
    if (lower.includes('medium')) { return '🟡'; }
    if (lower.includes('low')) { return '🟢'; }
    if (lower.includes('lowest')) { return '⚪'; }
    return '⚪';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
