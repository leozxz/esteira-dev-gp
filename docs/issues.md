# Issues — Hello World com Circunferência RGB Rotativa

> Gerado a partir de `docs/plans/prd.md` em 2026-02-26
> Estrutura: Épico > Task > Subtask

---

## Épico 1: Setup do Projeto

### EPIC-1

- **Título:** Setup inicial do projeto Hello World RGB
- **Descrição:** Criar a estrutura base do projeto, incluindo diretório e arquivo HTML esqueleto com meta tags e estrutura semântica mínima.
- **Critérios de Aceite:**
  - [ ] Diretório `hello-world-rgb/` criado na raiz do repositório
  - [ ] Arquivo `index.html` criado com estrutura HTML5 válida (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
  - [ ] Meta tags de charset (`UTF-8`) e viewport presentes
  - [ ] `<title>` definido como "Hello World RGB"
  - [ ] Arquivo abre no navegador sem erros no console
- **Labels:** `setup`, `priority:high`, `size:S`

---

#### Task 1.1

- **Título:** Criar diretório e arquivo HTML base
- **Descrição:** Criar o diretório `hello-world-rgb/` e o arquivo `index.html` com a estrutura HTML5 mínima. Incluir tag `<style>` vazia no `<head>` para CSS inline e a estrutura de divs definida na arquitetura: `.ring-container` > `.rgb-ring` > `.ring-inner` > `<h1>`.
- **Critérios de Aceite:**
  - [ ] Arquivo `hello-world-rgb/index.html` existe
  - [ ] Estrutura HTML5 válida com `lang="pt-BR"`
  - [ ] Meta charset UTF-8 e viewport presentes
  - [ ] Tag `<style>` vazia no `<head>`
  - [ ] Estrutura de divs conforme arquitetura (`.ring-container` > `.rgb-ring` > `.ring-inner` > `<h1>Hello World</h1>`)
  - [ ] Sem dependências externas (nenhum `<link>` ou `<script src>`)
- **Labels:** `setup`, `html`, `priority:high`, `size:S`

---

## Épico 2: Layout e Centralização

### EPIC-2

- **Título:** Implementar layout base com centralização
- **Descrição:** Configurar o layout da página com fundo escuro e centralização vertical/horizontal do conteúdo usando flexbox. Garante que o anel e o texto fiquem perfeitamente centralizados em qualquer tamanho de viewport (mín. 400×400px).
- **Critérios de Aceite:**
  - [ ] Fundo da página é `#0d0d0d`
  - [ ] Conteúdo está centralizado vertical e horizontalmente
  - [ ] Funciona em viewports de 400×400px até tela cheia
  - [ ] Sem scrollbar desnecessária
- **Labels:** `frontend`, `css`, `layout`, `priority:high`, `size:S`

---

#### Task 2.1

- **Título:** Configurar estilos do body e reset básico
- **Descrição:** Aplicar reset de margin/padding no body, definir fundo `#0d0d0d`, e configurar `min-height: 100vh` para ocupar a tela inteira. Não usar reset CSS externo — apenas o mínimo necessário inline.
- **Critérios de Aceite:**
  - [ ] `margin: 0` e `padding: 0` no body
  - [ ] `background: #0d0d0d` aplicado
  - [ ] `min-height: 100vh` definido
  - [ ] Sem scrollbar vertical quando conteúdo cabe na tela
- **Labels:** `css`, `layout`, `size:XS`

---

#### Task 2.2

- **Título:** Implementar centralização com flexbox
- **Descrição:** Aplicar `display: flex`, `justify-content: center` e `align-items: center` no container principal (body ou `.ring-container`) para centralizar o anel RGB no centro exato da viewport.
- **Critérios de Aceite:**
  - [ ] Anel fica centralizado horizontal e verticalmente
  - [ ] Centralização funciona em 400×400px e em 1920×1080px
  - [ ] Não usa `position: absolute` ou hacks de margin (flexbox puro)
- **Labels:** `css`, `layout`, `size:XS`

---

## Épico 3: Anel RGB com Gradiente Cônico

### EPIC-3

- **Título:** Implementar circunferência com gradiente RGB
- **Descrição:** Criar o anel (circunferência) visual usando `conic-gradient` com espectro completo de cores RGB e uma máscara circular interna para produzir o efeito de anel. Este é o componente visual principal do projeto. Refs: RF-02, RF-03.
- **Critérios de Aceite:**
  - [ ] Circunferência visível com gradiente de espectro completo (vermelho → amarelo → verde → ciano → azul → magenta → vermelho)
  - [ ] Formato de anel (não disco sólido) — centro transparente/escuro
  - [ ] Dimensões: 300×300px externo, 284×284px interno (espessura 8px)
  - [ ] `border-radius: 50%` em ambos os elementos
- **Labels:** `frontend`, `css`, `visual`, `priority:high`, `size:M`

---

#### Task 3.1

- **Título:** Criar div do gradiente cônico (`.rgb-ring`)
- **Descrição:** Implementar a div `.rgb-ring` com dimensões 300×300px, `border-radius: 50%` e `conic-gradient` com 7 color stops cobrindo o espectro completo RGB. O gradiente deve fechar o loop (começar e terminar em `#ff0000`) para transição seamless.
- **Critérios de Aceite:**
  - [ ] Div com 300×300px e `border-radius: 50%`
  - [ ] `conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)` aplicado
  - [ ] Gradiente visível como um disco colorido completo
  - [ ] Transição entre a última e primeira cor é suave (sem "corte" visual)
- **Labels:** `css`, `visual`, `conic-gradient`, `size:S`

---

#### Task 3.2

- **Título:** Criar máscara interna (`.ring-inner`)
- **Descrição:** Implementar a div `.ring-inner` como filha de `.rgb-ring`, com dimensões 284×284px, `border-radius: 50%`, `background: #0d0d0d`, centralizada via flexbox. Essa div sobrepõe o centro do gradiente, criando visualmente um anel de 8px de espessura.
- **Critérios de Aceite:**
  - [ ] Div interna com 284×284px e `border-radius: 50%`
  - [ ] Fundo `#0d0d0d` (mesmo da página)
  - [ ] Centralizada dentro de `.rgb-ring` (via flexbox no pai)
  - [ ] Efeito visual resultante é um anel/circunferência, não um disco
  - [ ] Espessura visível do anel é 8px uniformemente
- **Labels:** `css`, `visual`, `size:S`

---

##### Subtask 3.2.1

- **Título:** Garantir que `.rgb-ring` centraliza seu conteúdo
- **Descrição:** Adicionar `display: flex`, `justify-content: center` e `align-items: center` em `.rgb-ring` para que a máscara interna fique perfeitamente centralizada, resultando em espessura uniforme do anel em todos os lados.
- **Critérios de Aceite:**
  - [ ] `.rgb-ring` tem `display: flex` com centralização
  - [ ] Espessura do anel é visualmente igual nos 4 lados (8px)
- **Labels:** `css`, `detail`, `size:XS`

---

## Épico 4: Animação de Rotação

### EPIC-4

- **Título:** Implementar animação de rotação contínua do anel
- **Descrição:** Adicionar animação CSS que rotaciona o anel RGB continuamente em loop infinito. A animação deve ser suave (60fps), usar `transform: rotate` para ser GPU-accelerated, e ter velocidade constante (linear). Refs: RF-04, RF-05, RNF-04.
- **Critérios de Aceite:**
  - [ ] Anel gira continuamente sem parar
  - [ ] Rotação é suave a 60fps (sem jank)
  - [ ] Velocidade de rotação é constante (não acelera/desacelera)
  - [ ] Uma volta completa leva 3 segundos
  - [ ] Animação usa `transform` (GPU-accelerated)
- **Labels:** `frontend`, `css`, `animation`, `priority:high`, `size:S`

---

#### Task 4.1

- **Título:** Criar `@keyframes spin`
- **Descrição:** Definir a animação `@keyframes spin` com `from { transform: rotate(0deg) }` e `to { transform: rotate(360deg) }`. Essa animação será referenciada pela propriedade `animation` de `.rgb-ring`.
- **Critérios de Aceite:**
  - [ ] `@keyframes spin` definido no `<style>`
  - [ ] Usa `transform: rotate` (não `margin`, `left`, ou outra propriedade)
  - [ ] Rotação de 0deg a 360deg (volta completa)
- **Labels:** `css`, `animation`, `size:XS`

---

#### Task 4.2

- **Título:** Aplicar animação ao `.rgb-ring`
- **Descrição:** Adicionar `animation: spin 3s linear infinite` na classe `.rgb-ring`. Validar que a animação é suave e que o `timing-function: linear` produz velocidade constante.
- **Critérios de Aceite:**
  - [ ] `.rgb-ring` tem `animation: spin 3s linear infinite`
  - [ ] Animação inicia automaticamente ao carregar a página
  - [ ] Não há "pulo" visível entre o fim e o início de cada loop
  - [ ] Velocidade é constante durante toda a rotação
- **Labels:** `css`, `animation`, `size:XS`

---

##### Subtask 4.2.1

- **Título:** Validar performance da animação (GPU compositing)
- **Descrição:** Verificar via DevTools (Chrome > Performance tab ou Layers panel) que a animação de `.rgb-ring` está sendo composited na GPU e não causa layout/paint em cada frame. `transform` e `opacity` são as únicas propriedades que garantem isso.
- **Critérios de Aceite:**
  - [ ] DevTools mostra que `.rgb-ring` está em sua própria compositing layer
  - [ ] Não há layout/paint triggers durante a animação (apenas composite)
  - [ ] FPS estável em ~60fps no Performance monitor
- **Labels:** `qa`, `performance`, `size:XS`

---

## Épico 5: Tipografia e Texto

### EPIC-5

- **Título:** Implementar texto "Hello World" centralizado
- **Descrição:** Estilizar o elemento `<h1>` com o texto "Hello World" dentro do anel, centralizado, legível e visualmente elegante sobre o fundo escuro. Refs: RF-01.
- **Critérios de Aceite:**
  - [ ] Texto "Hello World" é exibido no centro exato do anel
  - [ ] Texto é legível (contraste ratio > 4.5:1 contra fundo)
  - [ ] Tipografia: system-ui, tamanho 2rem, peso 300, cor #ffffff
  - [ ] Texto não gira junto com o anel
- **Labels:** `frontend`, `css`, `typography`, `priority:high`, `size:S`

---

#### Task 5.1

- **Título:** Estilizar `<h1>` com tipografia definida
- **Descrição:** Aplicar estilos ao `<h1>`: `font-family: system-ui, -apple-system, sans-serif`, `font-size: 2rem`, `font-weight: 300`, `color: #ffffff`. Remover margin padrão do `<h1>` se necessário.
- **Critérios de Aceite:**
  - [ ] Font-family é `system-ui, -apple-system, sans-serif`
  - [ ] Font-size é `2rem`
  - [ ] Font-weight é `300` (light)
  - [ ] Cor é `#ffffff`
  - [ ] Margin do `<h1>` não desloca o texto do centro
- **Labels:** `css`, `typography`, `size:XS`

---

#### Task 5.2

- **Título:** Centralizar texto dentro do anel
- **Descrição:** Garantir que o `<h1>` está perfeitamente centralizado dentro de `.ring-inner` usando flexbox. O texto deve ficar no centro visual do anel, e **não** deve rotacionar junto com o gradiente (o texto fica estático, apenas o anel gira).
- **Critérios de Aceite:**
  - [ ] Texto está no centro visual do anel
  - [ ] `.ring-inner` usa flexbox para centralizar o `<h1>`
  - [ ] Texto permanece estático enquanto o anel gira
  - [ ] Funciona com textos de 1 ou 2 palavras sem quebrar layout
- **Labels:** `css`, `layout`, `size:XS`

---

## Épico 6: Validação e QA

### EPIC-6

- **Título:** Validar qualidade, compatibilidade e requisitos não-funcionais
- **Descrição:** Verificar que todos os requisitos funcionais e não-funcionais do PRD são atendidos. Testar em navegadores, validar performance, tamanho do arquivo e ausência de dependências externas. Refs: RF-01 a RF-06, RNF-01 a RNF-04.
- **Critérios de Aceite:**
  - [ ] Todos os RFs (01-06) validados
  - [ ] Todos os RNFs (01-04) validados
  - [ ] Testado em pelo menos Chrome + 1 outro navegador
  - [ ] Definition of Done do PRD 100% cumprida
- **Labels:** `qa`, `validation`, `priority:high`, `size:M`

---

#### Task 6.1

- **Título:** Testar em navegadores modernos
- **Descrição:** Abrir `index.html` em Chrome, Firefox, Safari (se macOS) e Edge. Verificar que o anel RGB é renderizado corretamente e a animação roda suavemente em todos.
- **Critérios de Aceite:**
  - [ ] Chrome: gradiente visível + animação suave
  - [ ] Firefox: gradiente visível + animação suave
  - [ ] Safari (macOS): gradiente visível + animação suave
  - [ ] Edge: gradiente visível + animação suave
  - [ ] Nenhum erro no console do DevTools em nenhum navegador
- **Labels:** `qa`, `cross-browser`, `size:S`

---

#### Task 6.2

- **Título:** Validar requisitos não-funcionais
- **Descrição:** Verificar que o arquivo final atende a todos os RNFs: arquivo único sem dependências, tamanho < 5KB, animação a 60fps.
- **Critérios de Aceite:**
  - [ ] Apenas 1 arquivo (`index.html`) — sem arquivos auxiliares
  - [ ] Nenhum `<link>`, `<script src>`, `@import`, ou referência externa
  - [ ] Tamanho do arquivo < 5KB (verificar com `ls -la` ou `wc -c`)
  - [ ] Performance monitor do Chrome mostra ~60fps constante
- **Labels:** `qa`, `nfr`, `size:S`

---

#### Task 6.3

- **Título:** Validar Definition of Done do PRD
- **Descrição:** Percorrer o checklist de DoD do PRD (seção 11) e marcar cada item como completo. Todos os itens devem estar cumpridos para considerar o projeto entregue.
- **Critérios de Aceite:**
  - [ ] Arquivo `index.html` existe em `hello-world-rgb/`
  - [ ] Abre no Chrome com "Hello World" + anel RGB girando
  - [ ] Animação é suave (sem jank)
  - [ ] Arquivo < 5KB
  - [ ] Zero dependências externas
  - [ ] Validado em pelo menos 1 navegador
- **Labels:** `qa`, `dod`, `size:XS`

---

## Resumo de Issues

| ID | Tipo | Título | Labels | Size |
|----|------|--------|--------|------|
| EPIC-1 | Épico | Setup inicial do projeto | `setup` | S |
| 1.1 | Task | Criar diretório e arquivo HTML base | `setup`, `html` | S |
| EPIC-2 | Épico | Layout base com centralização | `layout`, `css` | S |
| 2.1 | Task | Estilos do body e reset básico | `css`, `layout` | XS |
| 2.2 | Task | Centralização com flexbox | `css`, `layout` | XS |
| EPIC-3 | Épico | Anel RGB com gradiente cônico | `visual`, `css` | M |
| 3.1 | Task | Div do gradiente cônico | `css`, `conic-gradient` | S |
| 3.2 | Task | Máscara interna | `css`, `visual` | S |
| 3.2.1 | Subtask | Centralizar conteúdo do ring | `css`, `detail` | XS |
| EPIC-4 | Épico | Animação de rotação | `animation`, `css` | S |
| 4.1 | Task | @keyframes spin | `css`, `animation` | XS |
| 4.2 | Task | Aplicar animação ao ring | `css`, `animation` | XS |
| 4.2.1 | Subtask | Validar GPU compositing | `qa`, `performance` | XS |
| EPIC-5 | Épico | Tipografia e texto | `typography`, `css` | S |
| 5.1 | Task | Estilizar h1 | `css`, `typography` | XS |
| 5.2 | Task | Centralizar texto no anel | `css`, `layout` | XS |
| EPIC-6 | Épico | Validação e QA | `qa`, `validation` | M |
| 6.1 | Task | Testar em navegadores | `qa`, `cross-browser` | S |
| 6.2 | Task | Validar RNFs | `qa`, `nfr` | S |
| 6.3 | Task | Validar DoD do PRD | `qa`, `dod` | XS |

---

## Dependências entre Issues

```
EPIC-1 (Setup)
  └── Task 1.1
        ↓ bloqueia
EPIC-2 (Layout)
  ├── Task 2.1
  └── Task 2.2
        ↓ bloqueia
EPIC-3 (Anel RGB)
  ├── Task 3.1
  └── Task 3.2
  │     └── Subtask 3.2.1
        ↓ bloqueia
EPIC-4 (Animação)
  ├── Task 4.1
  └── Task 4.2
        └── Subtask 4.2.1
        ↓ bloqueia
EPIC-5 (Texto) ← pode ser paralelo com EPIC-3/4
  ├── Task 5.1
  └── Task 5.2
        ↓ todos bloqueiam
EPIC-6 (QA)
  ├── Task 6.1
  ├── Task 6.2
  └── Task 6.3
```

**Caminho crítico:** EPIC-1 → EPIC-2 → EPIC-3 → EPIC-4 → EPIC-6
**Paralelizável:** EPIC-5 pode rodar em paralelo com EPIC-3 e EPIC-4

---

## Estimativa Total

| Size | Quantidade | Peso |
|------|-----------|------|
| XS | 9 | ~15 min cada |
| S | 7 | ~30 min cada |
| M | 2 | ~1h cada |
| **Total estimado** | **18 issues** | **~6-8h** |

> Nota: estimativas são referência para planejamento de sprint, não compromisso.
