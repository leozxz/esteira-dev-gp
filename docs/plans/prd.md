# PRD & Design Doc — Hello World com Circunferência RGB Rotativa

**Data:** 2026-02-26
**Status:** Aprovado
**Autor:** Brainstorming assistido por IA

---

## 1. Contexto e Objetivo

Criar uma página web estática de demonstração ("Hello World") com uma circunferência animada que exibe um gradiente RGB rotativo. O projeto serve como estudo visual e peça de demonstração de animação CSS pura.

---

## 2. Escopo

### Em escopo
- Página HTML única, auto-contida (zero dependências externas)
- Circunferência (anel) com gradiente cônico RGB que rotaciona continuamente
- Texto "Hello World" centralizado dentro do anel
- Fundo escuro para destaque visual
- Compatibilidade com navegadores modernos (Chrome, Firefox, Safari, Edge)

### Fora de escopo
- Backend / API
- Deploy / hosting
- Responsividade avançada (mobile-first)
- Interatividade (cliques, inputs)
- Acessibilidade avançada (ARIA, screen readers)
- Testes automatizados

---

## 3. Requisitos e Critérios de Sucesso

### Requisitos Funcionais
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | A página exibe o texto "Hello World" centralizado na tela | Must |
| RF-02 | Uma circunferência (anel) envolve o texto | Must |
| RF-03 | O anel exibe gradiente com espectro completo RGB | Must |
| RF-04 | O gradiente rotaciona continuamente em loop infinito | Must |
| RF-05 | A animação é suave (60fps) sem travamentos | Must |
| RF-06 | A página funciona abrindo o arquivo diretamente no browser | Must |

### Requisitos Não-Funcionais
| ID | Requisito | Alvo |
|----|-----------|------|
| RNF-01 | Arquivo único (HTML + CSS inline) | 1 arquivo |
| RNF-02 | Zero dependências externas | 0 libs |
| RNF-03 | Tamanho do arquivo | < 5 KB |
| RNF-04 | Performance da animação | 60fps, GPU-accelerated |

### Critérios de Sucesso
- O arquivo `index.html` abre no navegador e a animação roda imediatamente
- O gradiente RGB é visível e rotaciona de forma contínua e suave
- O texto "Hello World" é legível no centro do anel

---

## 4. Restrições e Premissas

### Restrições
- HTML/CSS/JS puro — sem frameworks, bundlers ou CDN
- Arquivo único — todo CSS deve ser inline (`<style>`)
- Sem JavaScript obrigatório (CSS-only para animação)

### Premissas
- Será visualizado em navegadores que suportam `conic-gradient` (todos os modernos desde 2020+)
- Resolução mínima de tela: 400×400px
- O usuário abrirá o arquivo via `file://` ou servidor local simples

---

## 5. Abordagens Consideradas

### A) CSS `conic-gradient` + `transform: rotate` ✅ Escolhida
- **Descrição:** Div com `conic-gradient` como background, máscara circular interna para criar anel, `@keyframes` rotate
- **Prós:** ~30 linhas, zero JS, GPU-accelerated, código limpo
- **Contras:** Sem suporte IE11 (irrelevante)
- **Complexidade:** Baixa

### B) CSS `border` + `filter: hue-rotate` ❌ Rejeitada
- **Descrição:** Borda sólida com filtro `hue-rotate` animado
- **Prós:** Código mínimo (~20 linhas)
- **Contras:** Não produz gradiente visível — a cor muda uniformemente, sem efeito de "arco-íris girando"
- **Motivo da rejeição:** Não atende RF-03 (gradiente visível)

### C) Canvas 2D + JavaScript ❌ Rejeitada
- **Descrição:** `<canvas>` com `requestAnimationFrame` desenhando arcos
- **Prós:** Controle pixel a pixel, possibilidade de efeitos avançados
- **Contras:** ~80 linhas, requer JS, mais complexo
- **Motivo da rejeição:** Over-engineering para o requisito

---

## 6. Arquitetura Escolhida

### Estrutura Visual
```
┌──────────────────────────────────────┐
│            fundo #0d0d0d             │
│                                      │
│         ┌──────────────────┐         │
│         │  ╭──────────────╮│         │
│         │  │              ││         │
│         │  │  Hello       ││         │
│         │  │  World       ││ ← anel  │
│         │  │              ││   RGB   │
│         │  ╰──────────────╯│  gira   │
│         └──────────────────┘         │
│                                      │
└──────────────────────────────────────┘
```

### Estrutura HTML
```html
<body>
  <div class="ring-container">
    <div class="rgb-ring">          <!-- gradiente + rotação -->
      <div class="ring-inner">      <!-- máscara = cria o anel -->
        <h1>Hello World</h1>
      </div>
    </div>
  </div>
</body>
```

### Componentes CSS

| Componente | Responsabilidade | Técnica |
|------------|-----------------|---------|
| `body` | Fundo escuro, centralização | `background: #0d0d0d`, flexbox center |
| `.ring-container` | Layout | `display: flex`, centraliza vertical/horizontal |
| `.rgb-ring` | Gradiente + rotação | `conic-gradient(...)`, `border-radius: 50%`, `animation: spin` |
| `.ring-inner` | Máscara (cria anel) | `background: #0d0d0d`, `border-radius: 50%`, centralizada |
| `h1` | Texto | `color: #fff`, `font-weight: 300`, `font-size: 2rem` |

---

## 7. Especificações de Implementação

### Dimensões
- **Anel externo:** 300px × 300px
- **Máscara interna:** 284px × 284px (espessura do anel = 8px por lado)
- **Border-radius:** 50% (ambos)

### Gradiente (conic-gradient)
```css
background: conic-gradient(
  from 0deg,
  #ff0000,   /* vermelho */
  #ffff00,   /* amarelo */
  #00ff00,   /* verde */
  #00ffff,   /* ciano */
  #0000ff,   /* azul */
  #ff00ff,   /* magenta */
  #ff0000    /* volta ao vermelho (loop seamless) */
);
```

### Animação
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.rgb-ring {
  animation: spin 3s linear infinite;
}
```

- **Duração:** 3 segundos por volta
- **Timing:** linear (velocidade constante)
- **Iteração:** infinite
- **Performance:** `transform` é GPU-accelerated (composite-only, sem layout/paint)

### Tipografia
- **Font-family:** `system-ui, -apple-system, sans-serif`
- **Font-size:** `2rem`
- **Font-weight:** `300` (light)
- **Color:** `#ffffff`

### Cores
- **Fundo página:** `#0d0d0d`
- **Fundo máscara interna:** `#0d0d0d` (mesmo do body, cria ilusão de anel)
- **Texto:** `#ffffff`

---

## 8. Estrutura de Arquivos

```
hello-world-rgb/
└── index.html          # Arquivo único (HTML + CSS inline)
```

---

## 9. Compatibilidade

| Navegador | Suporte `conic-gradient` | Suporte `transform` |
|-----------|-------------------------|---------------------|
| Chrome 69+ | ✅ | ✅ |
| Firefox 83+ | ✅ | ✅ |
| Safari 12.1+ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ |
| IE 11 | ❌ | ✅ |

**Nota:** IE11 está fora de escopo (EOL desde junho 2022).

---

## 10. Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| `conic-gradient` não suportado | Muito Baixa | Alto | Fallback com `border` sólida colorida |
| Animação trava em hardware fraco | Baixa | Médio | `transform` é GPU-accelerated por padrão |
| Texto ilegível sobre fundo escuro | Baixa | Médio | Cor branca com contraste ratio > 15:1 |

---

## 11. Definition of Done

- [ ] Arquivo `index.html` criado na pasta `hello-world-rgb/`
- [ ] Abre no Chrome e exibe "Hello World" com anel RGB girando
- [ ] Animação é suave (sem jank visual)
- [ ] Arquivo tem < 5KB
- [ ] Zero dependências externas
- [ ] Validado em pelo menos 1 navegador

---

## 12. Decision Log

| Decisão | Data | Motivo | Alternativas Rejeitadas |
|---------|------|--------|------------------------|
| HTML/CSS/JS puro | 2026-02-26 | Simplicidade máxima, zero setup | React, Canvas, Three.js |
| conic-gradient + rotate | 2026-02-26 | Melhor trade-off código/efeito visual | hue-rotate (sem gradiente visível), Canvas (over-engineering) |
| Fundo escuro (#0d0d0d) | 2026-02-26 | Destaca o brilho RGB | Fundo claro (reduz contraste do efeito) |
| Espessura 8px | 2026-02-26 | Visível sem dominar o layout | Mais grosso (pesado), mais fino (pouco visível) |
| Duração 3s | 2026-02-26 | Velocidade agradável visualmente | 1s (rápido demais), 5s (lento) |

---

## 13. Próximos Passos

1. Aprovar este PRD
2. Implementar `index.html`
3. Testar no navegador
4. (Opcional) Adicionar efeitos extras: glow/shadow, hover interactions, responsividade
