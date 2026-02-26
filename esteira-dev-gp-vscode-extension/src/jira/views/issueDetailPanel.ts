import * as vscode from 'vscode';
import { JiraClient } from '../api/jiraClient';
import { JiraIssue } from '../models/types';
import { getBaseStyles } from '../../views/templates/baseStyles';
import { buildCsp, getNonce, wrapHtml } from '../../utils/htmlHelpers';

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

      case 'develop': {
        this.openClaudeWithIssue();
        break;
      }
    }
  }

  private openClaudeWithIssue(): void {
    const f = this.issue.fields;
    const descriptionText = this.extractPlainText(f.description);

    const prompt = [
      `Desenvolva a seguinte tarefa do Jira:`,
      ``,
      `Issue: ${this.issue.key}`,
      `Título: ${f.summary}`,
      `Tipo: ${f.issuetype.name}`,
      `Prioridade: ${f.priority.name}`,
      ...(descriptionText ? [``, `Descrição:`, descriptionText] : []),
    ].join('\n');

    const terminal = vscode.window.createTerminal(`Desenvolver ${this.issue.key}`);
    terminal.show();

    // Escape single quotes for shell
    const escaped = prompt.replace(/'/g, "'\\''");
    terminal.sendText(`claude '${escaped}'`);
  }

  private extractPlainText(description: unknown): string {
    if (!description || typeof description !== 'object') {
      return '';
    }

    const doc = description as { content?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> };
    if (!doc.content) {
      return '';
    }

    const lines: string[] = [];
    for (const block of doc.content) {
      if (block.content) {
        const text = block.content
          .filter((n) => n.type === 'text' && n.text)
          .map((n) => n.text!)
          .join('');
        if (text) {
          lines.push(text);
        }
      }
    }
    return lines.join('\n');
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
    const csp = buildCsp(nonce);
    const accentColor = '#0065FF';
    const f = issue.fields;
    const description = this.renderDescription(f.description);
    const statusColor = this.getStatusColor(f.status.statusCategory.key);
    const priorityEmoji = this.getPriorityEmoji(f.priority.name);
    const createdDate = new Date(f.created).toLocaleDateString('pt-BR');
    const updatedDate = new Date(f.updated).toLocaleDateString('pt-BR');
    const labels = f.labels.length > 0
      ? f.labels.map((l) => `<span class="tag">${this.escapeHtml(l)}</span>`).join('')
      : '<span class="muted">Nenhuma</span>';

    const assigneeName = f.assignee
      ? this.escapeHtml(f.assignee.displayName)
      : '<span class="muted">Não atribuído</span>';

    const issueTypeIcon = this.getIssueTypeIcon(f.issuetype.name);

    const styles = getBaseStyles(accentColor) + `
        .error-banner {
            display: none;
            background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
            border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
            color: var(--vscode-errorForeground, #f48771);
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 12px;
            word-break: break-word;
        }
        .error-banner.visible { display: block; }

        .issue-key {
            font-size: 13px;
            font-weight: 600;
            color: ${accentColor};
            letter-spacing: 0.3px;
        }

        .header-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }

        .btn-develop {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            background: ${accentColor};
            color: #fff;
            font-family: inherit;
            transition: opacity 0.15s ease, transform 0.1s ease;
            letter-spacing: 0.3px;
        }
        .btn-develop:hover { opacity: 0.85; }
        .btn-develop:active { transform: scale(0.97); }
        .btn-develop svg { width: 14px; height: 14px; }

        .meta-section {
            margin-top: 24px;
        }

        .meta-section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .meta-card {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 12px 14px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 8px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            transition: border-color 0.15s ease;
        }

        .meta-card:hover {
            border-color: color-mix(in srgb, ${accentColor} 40%, transparent);
        }

        .meta-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: var(--vscode-descriptionForeground);
        }

        .meta-value {
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 22px;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            color: white;
            letter-spacing: 0.2px;
        }

        .editable {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 4px;
            padding: 1px 4px;
            margin: -1px -4px;
            transition: background 0.15s ease;
        }
        .editable:hover {
            background: color-mix(in srgb, ${accentColor} 10%, transparent);
        }
        .editable .edit-icon {
            opacity: 0;
            font-size: 11px;
            transition: opacity 0.15s;
            color: ${accentColor};
        }
        .editable:hover .edit-icon { opacity: 0.8; }

        .inline-select {
            padding: 4px 8px;
            border: 1px solid color-mix(in srgb, ${accentColor} 40%, transparent);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 6px;
            font-family: var(--vscode-font-family);
            font-size: 12px;
            max-width: 200px;
            width: 100%;
        }
        .inline-select:focus {
            outline: none;
            border-color: ${accentColor};
            box-shadow: 0 0 0 1px color-mix(in srgb, ${accentColor} 30%, transparent);
        }

        .updating-text {
            font-style: italic;
            opacity: 0.6;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            background: color-mix(in srgb, ${accentColor} 15%, transparent);
            color: ${accentColor};
            margin-right: 4px;
        }

        .muted { color: var(--vscode-descriptionForeground); font-size: 12px; }

        .description-section {
            margin-top: 24px;
        }

        .description-card {
            padding: 16px 18px;
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            border-radius: 10px;
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            font-size: 13px;
            line-height: 1.7;
        }

        .description-card p {
            margin-bottom: 8px;
        }
        .description-card p:last-child {
            margin-bottom: 0;
        }

        .description-card h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 16px 0 8px;
        }
        .description-card h3:first-child {
            margin-top: 0;
        }

        .description-card ul, .description-card ol {
            padding-left: 20px;
            margin-bottom: 8px;
        }

        .description-card li {
            margin-bottom: 4px;
        }

        .description-card pre {
            padding: 12px 14px;
            border-radius: 6px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            overflow-x: auto;
            margin: 8px 0;
        }

        .description-card code {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
        }

        .description-card strong {
            font-weight: 600;
        }

        .dates-row {
            display: flex;
            gap: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
        }

        .date-item {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .date-item strong {
            font-weight: 600;
            margin-right: 4px;
        }
    `;

    const body = `
    <div id="errorBanner" class="error-banner"></div>

    <div class="stage-header">
        <div class="stage-icon">${issueTypeIcon}</div>
        <div class="stage-title">
            <p class="issue-key">${this.escapeHtml(issue.key)}</p>
            <h1>${this.escapeHtml(f.summary)}</h1>
        </div>
    </div>

    <div class="header-actions">
        <button class="btn-develop" id="developBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Desenvolver
        </button>
    </div>

    <div class="meta-section">
        <div class="meta-section-title">Detalhes</div>
        <div class="meta-grid">
            <div class="meta-card">
                <span class="meta-label">Status</span>
                <span class="meta-value" id="statusField">
                    <span class="editable" id="editStatusBtn">
                        <span class="status-badge" style="background:${statusColor}">${this.escapeHtml(f.status.name)}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Prioridade</span>
                <span class="meta-value" id="priorityField">
                    <span class="editable" id="editPriorityBtn">
                        <span>${priorityEmoji} ${this.escapeHtml(f.priority.name)}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Tipo</span>
                <span class="meta-value">${this.escapeHtml(f.issuetype.name)}</span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Responsável</span>
                <span class="meta-value" id="assigneeField">
                    <span class="editable" id="editAssigneeBtn">
                        <span>${assigneeName}</span>
                        <span class="edit-icon">\u270E</span>
                    </span>
                </span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Projeto</span>
                <span class="meta-value">${this.escapeHtml(f.project.name)}</span>
            </div>
            <div class="meta-card">
                <span class="meta-label">Labels</span>
                <span class="meta-value">${labels}</span>
            </div>
        </div>

        <div class="dates-row">
            <span class="date-item"><strong>Criado:</strong> ${createdDate}</span>
            <span class="date-item"><strong>Atualizado:</strong> ${updatedDate}</span>
        </div>
    </div>

    <div class="description-section">
        <div class="meta-section-title">Descrição</div>
        <div class="description-card">${description || '<span class="muted">Sem descrição</span>'}</div>
    </div>`;

    const script = `
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

        function editStatus() {
            hideError();
            const field = document.getElementById('statusField');
            field.innerHTML = '<span class="updating-text">Carregando...</span>';
            vscode.postMessage({ command: 'loadTransitions' });
        }

        function editPriority() {
            hideError();
            const field = document.getElementById('priorityField');
            field.innerHTML = '<span class="updating-text">Carregando...</span>';
            vscode.postMessage({ command: 'loadPriorities' });
        }

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

        document.getElementById('editStatusBtn').addEventListener('click', editStatus);
        document.getElementById('editPriorityBtn').addEventListener('click', editPriority);
        document.getElementById('editAssigneeBtn').addEventListener('click', editAssignee);
        document.getElementById('developBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'develop' });
        });
    `;

    return wrapHtml({ csp, styles, body, script, nonce, title: `${issue.key} - ${f.summary}` });
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

  private getIssueTypeIcon(typeName: string): string {
    const lower = typeName.toLowerCase();
    if (lower.includes('bug')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>';
    }
    if (lower.includes('story') || lower.includes('história')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    }
    if (lower.includes('epic')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    }
    if (lower.includes('sub')) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="3" y2="12"/></svg>';
    }
    // Default: task icon
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
  }

  private getPriorityEmoji(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('highest') || lower.includes('critical')) { return '\u{1F534}'; }
    if (lower.includes('high')) { return '\u{1F7E0}'; }
    if (lower.includes('medium')) { return '\u{1F7E1}'; }
    if (lower.includes('low')) { return '\u{1F7E2}'; }
    if (lower.includes('lowest')) { return '\u26AA'; }
    return '\u26AA';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
