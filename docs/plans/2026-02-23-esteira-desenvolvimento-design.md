# Design: Esteira de Desenvolvimento com Visibilidade Total

**Data:** 2026-02-23
**Status:** Draft
**Autor:** Time de Engenharia

---

## 1. Contexto e Objetivo

O time (11–20 pessoas) opera com uma esteira de desenvolvimento em 4 fases: **Produto → Dev → QA → Deploy**. Atualmente, demandas surgem por Slack e reuniões e frequentemente não são registradas formalmente — gerando trabalho invisível, tarefas perdidas e falta de rastreabilidade.

**Objetivo:** Alcançar **zero trabalho sem ticket** — todo trabalho executado pelo time deve ter um registro visível no Jira, independente de como a demanda surgiu.

---

## 2. Escopo / Fora de Escopo

### Escopo (este ciclo)
- Definir workflow no Jira com estados mapeados para as 4 fases
- Criar múltiplas portas de entrada para criação de tickets (baixo atrito)
- Implementar gate no GitHub (branch naming + PR check + auto-link)
- Definir lanes para diferentes tamanhos de demanda (Feature, Quick Fix, Hotfix)

### Fora de escopo
- Automação de CI/CD (pipeline técnico de build/deploy)
- Captura automática de action items de reuniões (IA/transcrição)
- Dashboards de métricas de produtividade
- Configuração interna do Orca Security / SonarQube

---

## 3. Requisitos e Critérios de Sucesso

| Critério | Métrica | Alvo |
|---|---|---|
| Cobertura de tickets | % de PRs com ticket linkado | 100% |
| Adoção | % do time usando as portas de entrada | > 90% em 30 dias |
| Atrito de criação | Tempo para criar um ticket (qualquer porta) | < 30 segundos |
| Visibilidade | Qualquer pessoa vê o status de qualquer trabalho | Board Jira atualizado |

---

## 4. Restrições e Premissas

### Restrições
- **Adoção do time é prioridade #1** — se o processo for complicado, ninguém usa
- Ferramentas existentes: Jira (board), GitHub (código), Slack (comunicação), Claude Code + MCP (dev workflow)
- Ferramentas de quality/security: CodeRabbit/Claude Code (review), Orca Security (segurança), SonarQube (qualidade de código)

### Premissas
- O time já trabalha com as 4 fases informalmente; o gap é formalizar sem burocratizar
- Jira é o board central (já existe, MCP já configurado)
- GitHub é onde PRs e code review acontecem

---

## 5. Abordagens Consideradas

### A) Multi-porta de entrada → Board único (ESCOLHIDA)
Um board central (Jira) com múltiplos pontos de criação de ticket — Slack, Claude Code MCP, Jira direto, reuniões.
- **Pró:** Respeita comportamento atual, adoção incremental
- **Contra:** Depende de disciplina

### B) Captura automática de conversas
Bot detecta action items em Slack/reuniões e sugere tickets automaticamente.
- **Pró:** Menor mudança de comportamento
- **Contra:** Falsos positivos, setup complexo, requer ajuste fino
- **Rejeitada:** Complexidade alta para o momento

### C) Gate obrigatório — sem ticket, sem merge (COMBINADA com A)
Branch naming + PR check como rede de segurança.
- **Pró:** Garantia hard de rastreabilidade
- **Contra:** Atrito se usado sozinho
- **Combinada com A:** Gate leve no PR como rede de segurança, não como única forma de enforcement

**Decisão:** Abordagem **A + C leve** — múltiplas portas de entrada fáceis + gate no GitHub como rede de segurança.

---

## 6. Arquitetura Escolhida

```
┌──────────────────────────────────────────────────────────────────────┐
│                     ESTEIRA COMPLETA                                 │
│                                                                      │
│  ENTRADA                    JIRA (Board)              SAÍDA          │
│  ═══════                    ══════════════             ═════          │
│                                                                      │
│  Slack ──emoji/cmd──┐                                                │
│  Claude Code MCP ───┤──→ TRIAGE ──→ [Lane] ──→ Dev ──→ QA ──→ Deploy│
│  Jira direto ───────┤       │                   │       │       │    │
│  Reunião (manual) ──┘       │                   │       │       │    │
│                        triador decide      PR check  testes   Orca + │
│                        lane + prioridade   no GitHub          Sonar  │
│                                                                      │
│  GATES:                                                              │
│  • PR requer PROJ-XXX no branch/título                               │
│  • PR auto-linka com Jira                                            │
│  • Deploy roda Orca Security + SonarQube                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Workflow no Jira (Estados)

```
┌──────────┬───────────────┬────────────┬────────────┬────────────┐
│ Triage   │ Produto       │ Dev        │ QA         │ Deploy     │
│          │               │            │            │            │
│ • Inbox  │ • Refinamento │ • Doing    │ • Testing  │ • Staging  │
│          │ • PRD Ready   │ • Review   │ • Bug      │ • Prod     │
│          │ • Ready4Dev   │            │   Found    │            │
│          │               │            │            │ • Done ✓   │
└──────────┴───────────────┴────────────┴────────────┴────────────┘
```

### Transições permitidas (retornos)
- **Bug Found → Doing:** QA encontrou problema, volta para Dev com comentário detalhado
- **Doing → Refinamento:** Dev não consegue interpretar requisito, volta para Produto
- **Testing → Doing:** Teste regressivo falhou, dev precisa corrigir

---

## 8. Lanes (tamanhos de demanda)

| Lane | Tipo de demanda | Exemplo | Fluxo |
|---|---|---|---|
| **Full** | Feature nova, mudança significativa | "Criar módulo de relatórios" | Triage → Refinamento → PRD → Ready4Dev → Doing → Review → Testing → Staging → Prod |
| **Quick** | Fix pequeno, mudança cosmética | "Mudar cor do botão de verde para rosa" | Triage → Doing → Review → Testing → Prod |
| **Hotfix** | Produção quebrada, urgência | "API retornando 500 para todos os users" | Triage → Doing → Review → Prod (post-mortem depois) |

### Como diferenciar no Jira
- **Issue Type** ou **Label** define a lane
- Triador decide na etapa de Triage
- Regra simples: < 2h = Quick, precisa PRD = Full, produção quebrada = Hotfix

---

## 9. Portas de Entrada (detalhamento)

### Porta 1: Slack → Jira
- **Ferramenta:** Atlassian for Slack (integração oficial)
- **Como:** `/jira create` ou atalho de mensagem → cria issue no Triage
- **Contexto:** Mensagem original vira descrição da issue
- **Quem usa:** Todo mundo (Slack é o canal #1)
- **Atrito:** Muito baixo (1 comando)

### Porta 2: Jira direto
- **Como:** Criar issue com template pré-definido
- **Templates sugeridos:**
  - Feature (campos: objetivo, critérios de aceite, estimativa)
  - Task/Quick Fix (campos: descrição, prioridade)
  - Bug (campos: steps to reproduce, expected vs actual, ambiente)
  - Hotfix (campos: impacto, urgência, workaround)
- **Quem usa:** Produto/PMs para demandas formais
- **Atrito:** Baixo

### Porta 3: Claude Code + Jira MCP
- **Como:** Dev no terminal pede ao Claude Code para criar/atualizar issue
- **Capacidades já disponíveis:**
  - Criar issue (`createJiraIssue`)
  - Buscar issues (`searchJiraIssuesUsingJql`)
  - Atualizar issue (`editJiraIssue`)
  - Transitar status (`transitionJiraIssue`)
  - Adicionar comentário (`addCommentToJiraIssue`)
- **Quem usa:** Devs durante o desenvolvimento
- **Atrito:** Muito baixo (linguagem natural no terminal)
- **Cenários-chave:**
  - Dev descobre algo durante o código → cria ticket sem sair do terminal
  - Dev vai codar algo pedido "boca a boca" → cria ticket antes de começar
  - Dev terminou → move ticket para Review via MCP

### Porta 4: Reuniões → Jira
- **Como:** Nos últimos 5 minutos da call, facilitador cria tickets
- **Pode usar:** Slack (rápido) ou Jira direto
- **Rotina sugerida:** Ao final de cada daily/planning, perguntar "o que virou ticket?"
- **Quem:** Facilitador da reunião (rotação)
- **Atrito:** Médio (depende de disciplina/cultura)

---

## 10. Gate no GitHub (detalhamento)

### 10.1 Convenção de Branch
```
Formato: <tipo>/PROJ-<número>-<descrição-curta>
Exemplos:
  feat/PROJ-123-modulo-relatorios
  fix/PROJ-456-corrigir-botao-login
  hotfix/PROJ-789-api-500-error
```

### 10.2 PR Check (GitHub Action)
Validações no PR:
1. Branch **ou** título do PR contém `PROJ-XXX` (pattern: `/[A-Z]+-\d+/`)
2. (Opcional) Verificar via API do Jira que a issue existe e não está "Done"
3. Bloquear merge se check falhar

### 10.3 Link Automático (Jira ↔ GitHub)
- Configurar Jira + GitHub integration (oficial da Atlassian)
- PRs aparecem automaticamente na issue do Jira
- Opcionalmente: merge do PR transita a issue automaticamente (ex: Review → Testing)

---

## 11. Segurança e Quality Gates (ferramentas existentes)

| Fase | Ferramenta | O que faz |
|---|---|---|
| Dev - Review | CodeRabbit / Claude Code | Code review automatizado |
| Deploy - Segurança | Orca Security | Análise de vulnerabilidades |
| Deploy - Qualidade | SonarQube | Análise de qualidade de código |

Estas ferramentas já existem no pipeline e não são escopo de configuração deste design.

---

## 12. Plano de Rollout

### Milestone 1: Fundação (Semana 1-2)
- [ ] Configurar workflow no Jira (estados conforme Seção 7)
- [ ] Criar templates de issue type (Feature, Task, Bug, Hotfix)
- [ ] Configurar integração Slack → Jira (Atlassian for Slack)
- [ ] Documentar convenção de branch naming

### Milestone 2: Gates (Semana 2-3)
- [ ] Criar GitHub Action para validar ticket no PR
- [ ] Configurar integração Jira ↔ GitHub (link automático)
- [ ] Testar fluxo completo: Slack → Jira → Branch → PR → Jira update

### Milestone 3: Adoção (Semana 3-4)
- [ ] Workshop com o time: como usar cada porta de entrada
- [ ] Documentar "cheat sheet" de comandos (Slack, Claude Code MCP)
- [ ] Definir triador (rotação semanal)
- [ ] Iniciar rotina de "5 min de tickets" no final de reuniões

### Milestone 4: Ajuste (Semana 4+)
- [ ] Revisar adoção: % de PRs com ticket
- [ ] Coletar feedback do time
- [ ] Ajustar workflow/lanes baseado no uso real

---

## 13. Riscos e Mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Time não adota as portas de entrada | Alto | Gate no PR como rede de segurança + workshop + cheat sheet |
| Triage vira gargalo | Médio | Rotação de triador + regra: se não triado em 24h, escala |
| Excesso de burocracia em tasks pequenas | Médio | Lane Quick pula Produto inteiro |
| Reuniões continuam sem gerar tickets | Médio | Rotina de "5 min finais" + facilitador responsável |
| MCP/Claude Code não usado por todos os devs | Baixo | É apenas uma das portas — Slack é a principal |

---

## 14. Decision Log

| # | Decisão | Data | Motivo | Alternativas rejeitadas |
|---|---|---|---|---|
| 1 | Jira como board central | 2026-02-23 | Já em uso, MCP configurado, zero custo de migração | Linear (boa UX mas custo de migração) |
| 2 | Abordagem A + C leve | 2026-02-23 | Equilibra adoção (multi-entrada) com garantia (gate no PR) | B (captura automática - muito complexo), C puro (muito rígido) |
| 3 | Triage como estado obrigatório | 2026-02-23 | Resolve o "boca a boca" — tudo passa por Triage, triador decide lane | Sem triage (demanda vai direto pro estado final) |
| 4 | 3 lanes (Full/Quick/Hotfix) | 2026-02-23 | Nem tudo precisa de PRD, mas produção quebrada precisa de fast-track | Lane única (burocracia) ou muitas lanes (confusão) |
| 5 | Gate leve (só PR, não commit) | 2026-02-23 | Não atrapalha dev local, mas garante rastreabilidade antes do merge | Gate em commit (muito restritivo), sem gate (sem garantia) |

---

## 15. Perguntas Abertas

- [ ] Qual o project key no Jira? (para padronizar branch naming)
- [ ] Quem será o primeiro triador?
- [ ] O time já usa Atlassian for Slack ou precisa instalar?
- [ ] Há automações existentes no Jira que podem conflitar com o novo workflow?
- [ ] Qual a política de retenção de issues (arquivar Done após X dias)?
