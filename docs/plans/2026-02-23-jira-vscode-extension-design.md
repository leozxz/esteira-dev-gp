# Design Doc: Extensão VS Code para Jira

**Data:** 2026-02-23
**Status:** Aprovado para implementação
**Autor:** Leonardo + Claude

---

## 1. Contexto e Objetivo

Desenvolvedores perdem tempo alternando entre VS Code e browser para gerenciar issues no Jira. O objetivo é criar uma extensão VS Code que permita **criar e visualizar issues do Jira** sem sair do editor.

**Objetivo mensurável:** Eliminar a necessidade de abrir o browser para operações básicas de Jira (criar issue, ver detalhes) durante o desenvolvimento.

## 2. Escopo

### Entra (v1)
- Login via OAuth 2.0 + PKCE (abre browser, volta pro VS Code)
- Listar issues atribuídas ao usuário na sidebar (TreeView)
- Ver detalhes de uma issue (título, descrição, status, prioridade, assignee)
- Criar nova issue (projeto, tipo, título, descrição)
- Status bar com estado da conexão

### Fora de escopo (v1)
- Mudar status de issues
- Adicionar comentários
- Boards Kanban / Sprint views
- Filtros JQL customizados
- Integração com branches/commits
- Suporte a Jira Server/Data Center
- Publicação no Marketplace

## 3. Restrições e Premissas

- **Target:** Jira Cloud (API REST v3)
- **Distribuição:** Uso pessoal/time (VSIX local ou repositório privado)
- **Auth:** OAuth 2.0 Authorization Code + PKCE
- **Linguagem:** TypeScript
- **Runtime:** VS Code Extension Host (Node.js)

## 4. Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   VS Code                        │
│                                                  │
│  ┌──────────────┐   ┌────────────────────────┐  │
│  │  TreeView     │   │   Webview Panel        │  │
│  │  (Sidebar)    │   │  - Detalhes da issue   │  │
│  │  Issues por   │──▶│  - Formulário criar    │  │
│  │  projeto      │   │    nova issue          │  │
│  └──────────────┘   └────────────────────────┘  │
│          │                      │                │
│  ┌──────────────────────────────────────────┐   │
│  │        Extension Host (TypeScript)        │   │
│  │  - JiraAuthProvider (OAuth 2.0 + PKCE)   │   │
│  │  - JiraApiClient (REST v3)               │   │
│  │  - IssueTreeDataProvider                 │   │
│  │  - Token storage (SecretStorage)         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
                      ▼
            ┌──────────────────┐
            │  Jira Cloud API  │
            │  (REST v3)       │
            └──────────────────┘
```

## 5. Fluxo OAuth 2.0 + PKCE

1. Usuário executa "Jira: Login"
2. Extensão gera `code_verifier` (random 128 chars) + `code_challenge` (SHA-256 + base64url)
3. Abre browser com URL de autorização Atlassian:
   - `https://auth.atlassian.com/authorize`
   - `audience=api.atlassian.com`
   - `client_id=APP_CLIENT_ID`
   - `scope=read:jira-work write:jira-work read:jira-user offline_access`
   - `redirect_uri=vscode://publisher.jira-extension/callback`
   - `code_challenge=...&code_challenge_method=S256`
   - `response_type=code`
   - `state=RANDOM_STATE`
4. Usuário faz login no Atlassian
5. Redirect para `vscode://...` URI — VS Code captura via `UriHandler`
6. Extensão troca `code` + `code_verifier` por tokens em `https://auth.atlassian.com/oauth/token`
7. Busca `cloudId` via `https://api.atlassian.com/oauth/token/accessible-resources`
8. Salva `accessToken`, `refreshToken`, `expiresAt`, `cloudId` no SecretStorage
9. Popula sidebar com issues

**Token refresh:** Antes de cada chamada, verifica se `expiresAt < now()`. Se sim, usa refresh_token para obter novo access_token.

## 6. Estrutura de Arquivos

```
jira-vscode-extension/
├── package.json
├── tsconfig.json
├── .vscodeignore
├── src/
│   ├── extension.ts              # activate/deactivate
│   ├── auth/
│   │   ├── jiraAuthProvider.ts   # OAuth 2.0 + PKCE
│   │   └── tokenManager.ts      # SecretStorage wrapper
│   ├── api/
│   │   └── jiraClient.ts        # Jira REST API v3 client
│   ├── views/
│   │   ├── issueTreeProvider.ts  # TreeView sidebar
│   │   ├── issueDetailPanel.ts   # Webview detalhes
│   │   └── createIssuePanel.ts   # Webview criar issue
│   ├── models/
│   │   └── types.ts              # Interfaces TS
│   └── utils/
│       └── config.ts             # Constantes
├── media/
│   ├── icons/
│   └── webview/
│       ├── detail.html
│       ├── create.html
│       └── styles.css
└── test/
    └── suite/
```

## 7. Modelo de Dados

```typescript
interface JiraIssue {
  id: string;
  key: string;              // "PROJ-123"
  summary: string;
  description: string;      // ADF format
  status: { name: string; categoryKey: string };
  priority: { name: string; iconUrl: string };
  assignee?: { displayName: string; avatarUrl: string };
  project: { key: string; name: string };
  created: string;
  updated: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface CreateIssuePayload {
  projectKey: string;
  issueTypeName: string;
  summary: string;
  description?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  cloudId: string;
}
```

## 8. API Endpoints Utilizados

| Operação | Método | Endpoint |
|---|---|---|
| Authorize | GET | `https://auth.atlassian.com/authorize` |
| Token exchange | POST | `https://auth.atlassian.com/oauth/token` |
| Get cloud ID | GET | `https://api.atlassian.com/oauth/token/accessible-resources` |
| Listar issues | GET | `/rest/api/3/search?jql=assignee=currentUser()` |
| Detalhe issue | GET | `/rest/api/3/issue/{issueKey}` |
| Criar issue | POST | `/rest/api/3/issue` |
| Listar projetos | GET | `/rest/api/3/project` |
| Issue types | GET | `/rest/api/3/issue/createmeta/{projectKey}/issuetypes` |

**Base URL:** `https://api.atlassian.com/ex/jira/{cloudId}`

## 9. Segurança

- Tokens armazenados exclusivamente via `context.secrets` (SecretStorage → Keychain macOS / Credential Manager Windows)
- OAuth PKCE: sem client_secret no código
- `state` parameter para prevenir CSRF
- HTTPS em todas as chamadas
- Logout limpa todos os secrets

## 10. Commands e UI

### Commands (package.json)

| ID | Título | Quando |
|---|---|---|
| `jira.login` | Jira: Login | Sempre |
| `jira.logout` | Jira: Logout | Quando logado |
| `jira.createIssue` | Jira: Criar Issue | Quando logado |
| `jira.refreshIssues` | Jira: Atualizar | Quando logado |

### Views
- **Activity Bar:** Ícone Jira na sidebar
- **TreeView:** Issues agrupadas por projeto
- **Webview Panel:** Detalhes de issue / formulário de criação
- **Status Bar:** Estado da conexão

## 11. Plano de Entrega

### Milestone 1 — Scaffold + Auth
- Scaffold da extensão (yo code generator)
- OAuth 2.0 + PKCE completo
- Token refresh automático
- Status bar com estado de conexão
- **Critério de aceite:** Login e logout funcionando

### Milestone 2 — Listar Issues
- JiraApiClient (search, get issue)
- IssueTreeDataProvider (sidebar)
- Agrupamento por projeto
- Refresh manual
- **Critério de aceite:** Issues do usuário visíveis na sidebar

### Milestone 3 — Ver Detalhes
- Webview panel para detalhes
- Renderização de descrição (ADF → HTML básico)
- Exibir status, prioridade, assignee
- **Critério de aceite:** Click em issue mostra detalhes formatados

### Milestone 4 — Criar Issue
- Webview formulário (projeto, tipo, título, descrição)
- Dropdown de projetos e issue types (via API)
- Submit → cria issue → feedback de sucesso
- Sidebar atualiza após criação
- **Critério de aceite:** Issue criada aparece no Jira e na sidebar

## 12. Decision Log

| Decisão | Data | Motivo | Alternativas rejeitadas |
|---|---|---|---|
| OAuth 2.0 + PKCE | 2026-02-23 | UX profissional (login via browser), sem API token manual | API Token (simples mas menos elegante), OAuth + servidor local (complexo demais) |
| Extensão pura VS Code | 2026-02-23 | Sem dependências externas, URI Handler nativo resolve callback | Extensão + Express local (over-engineering pro MVP) |
| SecretStorage | 2026-02-23 | API nativa, usa keychain do OS, seguro | Settings (plaintext!), .env file (inseguro) |
| Webview para detalhes/criação | 2026-02-23 | Flexibilidade total de UI (HTML/CSS/JS) | QuickPick/InputBox (limitado demais para detalhes) |

## 13. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| OAuth callback URI pode não funcionar em alguns OS | Alto | Testar em macOS/Windows/Linux; fallback para API Token como alternativa |
| ADF (Atlassian Document Format) complexo de renderizar | Médio | Renderizar apenas texto básico na v1, melhorar depois |
| Rate limiting da API Jira | Baixo | Implementar retry com backoff; cache local básico |
| Atlassian deprecar API v3 | Baixo | Monitorar changelogs; API é estável |
