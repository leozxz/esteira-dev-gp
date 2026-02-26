import * as vscode from 'vscode';
import { JiraClient } from '../api/jiraClient';
import { CreateIssuePayload, JiraFieldMeta, JiraIssueType, JiraProject } from '../models/types';

interface WebviewMessage {
  command: string;
  projectKey?: string;
  issueType?: string;
  issueTypeId?: string;
  summary?: string;
  description?: string;
  customFields?: Record<string, string>;
}

export class CreateIssuePanel {
  private static instance: CreateIssuePanel | undefined;
  private panel: vscode.WebviewPanel;
  private projects: JiraProject[] = [];
  private issueTypes: JiraIssueType[] = [];
  private customFieldsMeta: JiraFieldMeta[] = [];

  static async show(
    jiraClient: JiraClient,
    extensionUri: vscode.Uri,
    onCreated: () => void
  ): Promise<void> {
    if (CreateIssuePanel.instance) {
      CreateIssuePanel.instance.panel.reveal();
      return;
    }

    const instance = new CreateIssuePanel(jiraClient, extensionUri, onCreated);
    CreateIssuePanel.instance = instance;
    await instance.initialize();
  }

  private constructor(
    private jiraClient: JiraClient,
    extensionUri: vscode.Uri,
    private onCreated: () => void
  ) {
    this.panel = vscode.window.createWebviewPanel(
      'jiraCreateIssue',
      'Criar Issue — Jira',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
      }
    );

    this.panel.iconPath = new vscode.ThemeIcon('new-file');

    this.panel.onDidDispose(() => {
      CreateIssuePanel.instance = undefined;
    });

    this.panel.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this.handleMessage(msg)
    );
  }

  private async initialize(): Promise<void> {
    try {
      this.projects = await this.jiraClient.getProjects();
      this.panel.webview.html = this.getHtml();
    } catch (err) {
      vscode.window.showErrorMessage(`Erro ao carregar projetos: ${err}`);
      this.panel.dispose();
    }
  }

  private async handleMessage(msg: WebviewMessage): Promise<void> {
    switch (msg.command) {
      case 'loadIssueTypes': {
        if (!msg.projectKey) { return; }
        try {
          this.issueTypes = await this.jiraClient.getIssueTypes(msg.projectKey);
          this.panel.webview.postMessage({
            command: 'issueTypesLoaded',
            issueTypes: this.issueTypes.map((t) => ({ id: t.id, name: t.name })),
          });
        } catch (err) {
          vscode.window.showErrorMessage(`Erro ao carregar tipos: ${err}`);
        }
        break;
      }

      case 'loadCustomFields': {
        if (!msg.projectKey || !msg.issueTypeId) { return; }
        try {
          const fields = await this.jiraClient.getCreateMeta(msg.projectKey, msg.issueTypeId);
          this.customFieldsMeta = fields;
          this.panel.webview.postMessage({
            command: 'customFieldsLoaded',
            fields: fields.map((f) => ({
              fieldId: f.fieldId,
              name: f.name,
              required: f.required,
              type: f.schema.type,
              allowedValues: f.allowedValues?.map((v) => ({
                id: v.id,
                label: v.name || v.value || v.id,
              })),
            })),
          });
        } catch (err) {
          // Non-blocking: custom fields are best-effort
          this.panel.webview.postMessage({ command: 'customFieldsLoaded', fields: [] });
        }
        break;
      }

      case 'createIssue': {
        if (!msg.projectKey || !msg.issueType || !msg.summary) {
          this.panel.webview.postMessage({
            command: 'createError',
            errorMessage: 'Preencha todos os campos obrigatórios.',
          });
          return;
        }

        try {
          this.panel.webview.postMessage({ command: 'creating' });

          const payload: CreateIssuePayload = {
            fields: {
              project: { key: msg.projectKey },
              issuetype: { name: msg.issueType },
              summary: msg.summary,
            },
          };

          if (msg.description?.trim()) {
            payload.fields.description = {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: msg.description.trim() }],
                },
              ],
            };
          }

          // Add custom fields to payload using stored metadata for correct formatting
          if (msg.customFields) {
            for (const [fieldId, value] of Object.entries(msg.customFields)) {
              if (value) {
                const meta = this.customFieldsMeta.find((f) => f.fieldId === fieldId);
                if (meta?.allowedValues && meta.allowedValues.length > 0) {
                  if (meta.schema.type === 'array') {
                    payload.fields[fieldId] = [{ id: value as string }];
                  } else {
                    payload.fields[fieldId] = { id: value };
                  }
                } else if (meta?.schema.type === 'number') {
                  payload.fields[fieldId] = Number(value);
                } else {
                  payload.fields[fieldId] = value;
                }
              }
            }
          }

          const issue = await this.jiraClient.createIssue(payload);
          vscode.window.showInformationMessage(
            `Issue ${issue.key} criada com sucesso!`
          );
          this.onCreated();
          this.panel.dispose();
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Erro ao criar issue: ${errorMsg}`);
          this.panel.webview.postMessage({
            command: 'createError',
            errorMessage: errorMsg,
          });
        }
        break;
      }
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    const projectOptions = this.projects
      .map((p) => `<option value="${escapeAttr(p.key)}">${escapeHtml(p.name)} (${escapeHtml(p.key)})</option>`)
      .join('\n');

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
      max-width: 600px;
      margin: 0 auto;
    }
    h1 { font-size: 1.3em; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    label {
      display: block;
      font-size: 0.85em;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--vscode-descriptionForeground);
    }
    label .required { color: var(--vscode-errorForeground); }
    select, input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-family: var(--vscode-font-family);
      font-size: 0.95em;
      box-sizing: border-box;
    }
    select:focus, input:focus, textarea:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
    }
    textarea { resize: vertical; min-height: 100px; }
    button {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-size: 0.95em;
      cursor: pointer;
      font-weight: 600;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-row { margin-top: 20px; display: flex; gap: 8px; }
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
  <h1>Criar Nova Issue</h1>
  <div id="errorBanner" class="error-banner"></div>

  <div class="form-group">
    <label>Projeto <span class="required">*</span></label>
    <select id="project">
      <option value="">Selecione um projeto...</option>
      ${projectOptions}
    </select>
  </div>

  <div class="form-group">
    <label>Tipo <span class="required">*</span></label>
    <select id="issueType" disabled>
      <option value="">Selecione o projeto primeiro...</option>
    </select>
  </div>

  <div class="form-group">
    <label>Título <span class="required">*</span></label>
    <input type="text" id="summary" placeholder="Resumo da issue..." />
  </div>

  <div class="form-group">
    <label>Descrição</label>
    <textarea id="description" placeholder="Descreva a issue (opcional)..."></textarea>
  </div>

  <div id="customFieldsContainer"></div>

  <div class="btn-row">
    <button id="submitBtn" disabled>Criar Issue</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const projectEl = document.getElementById('project');
    const typeEl = document.getElementById('issueType');
    const summaryEl = document.getElementById('summary');
    const descEl = document.getElementById('description');
    const submitBtn = document.getElementById('submitBtn');
    const customFieldsContainer = document.getElementById('customFieldsContainer');
    const errorBanner = document.getElementById('errorBanner');

    function showError(message) {
      errorBanner.textContent = message;
      errorBanner.classList.add('visible');
    }

    function hideError() {
      errorBanner.classList.remove('visible');
      errorBanner.textContent = '';
    }

    let currentIssueTypes = [];
    let currentCustomFields = [];

    function validateForm() {
      const baseValid = projectEl.value && typeEl.value && summaryEl.value.trim();
      if (!baseValid) { submitBtn.disabled = true; return; }
      // Check all required custom fields
      const allRequiredFilled = currentCustomFields.every(f => {
        const el = document.getElementById('cf_' + f.fieldId);
        return el && el.value;
      });
      submitBtn.disabled = !allRequiredFilled;
    }

    projectEl.addEventListener('change', () => {
      if (projectEl.value) {
        typeEl.disabled = true;
        typeEl.innerHTML = '<option value="">Carregando...</option>';
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
        vscode.postMessage({ command: 'loadIssueTypes', projectKey: projectEl.value });
      } else {
        typeEl.disabled = true;
        typeEl.innerHTML = '<option value="">Selecione o projeto primeiro...</option>';
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
      }
      validateForm();
    });

    typeEl.addEventListener('change', () => {
      // When issue type changes, load custom required fields
      const selected = currentIssueTypes.find(t => t.name === typeEl.value);
      if (selected && projectEl.value) {
        customFieldsContainer.innerHTML = '<p style="opacity:0.6;font-size:0.85em;">Carregando campos obrigatórios...</p>';
        vscode.postMessage({
          command: 'loadCustomFields',
          projectKey: projectEl.value,
          issueTypeId: selected.id,
        });
      } else {
        customFieldsContainer.innerHTML = '';
        currentCustomFields = [];
      }
      validateForm();
    });

    summaryEl.addEventListener('input', validateForm);

    submitBtn.addEventListener('click', () => {
      hideError();
      const customFields = {};
      for (const f of currentCustomFields) {
        const el = document.getElementById('cf_' + f.fieldId);
        if (el && el.value) {
          customFields[f.fieldId] = el.value;
        }
      }
      vscode.postMessage({
        command: 'createIssue',
        projectKey: projectEl.value,
        issueType: typeEl.value,
        summary: summaryEl.value.trim(),
        description: descEl.value,
        customFields: customFields,
      });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'issueTypesLoaded') {
        currentIssueTypes = msg.issueTypes;
        typeEl.innerHTML = '<option value="">Selecione...</option>' +
          msg.issueTypes.map(t => '<option value="' + t.name + '" data-id="' + t.id + '">' + t.name + '</option>').join('');
        typeEl.disabled = false;
        validateForm();
      }
      if (msg.command === 'customFieldsLoaded') {
        currentCustomFields = msg.fields;
        if (msg.fields.length === 0) {
          customFieldsContainer.innerHTML = '';
        } else {
          customFieldsContainer.innerHTML = msg.fields.map(f => {
            if (f.allowedValues && f.allowedValues.length > 0) {
              const options = f.allowedValues.map(v =>
                '<option value="' + v.id + '">' + v.label + '</option>'
              ).join('');
              return '<div class="form-group">' +
                '<label>' + f.name + ' <span class="required">*</span></label>' +
                '<select id="cf_' + f.fieldId + '">' +
                '<option value="">Selecione...</option>' + options +
                '</select></div>';
            }
            return '<div class="form-group">' +
              '<label>' + f.name + ' <span class="required">*</span></label>' +
              '<input type="text" id="cf_' + f.fieldId + '" placeholder="' + f.name + '..." /></div>';
          }).join('');
          for (const f of msg.fields) {
            const el = document.getElementById('cf_' + f.fieldId);
            if (el) { el.addEventListener('change', validateForm); el.addEventListener('input', validateForm); }
          }
        }
        validateForm();
      }
      if (msg.command === 'creating') {
        hideError();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando...';
      }
      if (msg.command === 'createError') {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Issue';
        if (msg.errorMessage) {
          showError(msg.errorMessage);
        }
      }
    });
  </script>
</body>
</html>`;
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
