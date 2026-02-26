export interface ProdutoStep {
    id: number;
    title: string;
    description: string;
    buttonLabel: string;
    terminalCommand: string;
    icon: string;
}

export const PRODUTO_STEPS: ProdutoStep[] = [
    {
        id: 1,
        title: 'Brainstorming',
        description: 'Explore ideias, descubra oportunidades e defina o problema a resolver com o Claude.',
        buttonLabel: 'Iniciar Brainstorming',
        terminalCommand: 'claude "/brainstorming"',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    },
    {
        id: 2,
        title: 'Plano de Implementação',
        description: 'Gere um plano técnico detalhado com etapas, dependências e estimativas.',
        buttonLabel: 'Gerar Plano',
        terminalCommand: 'claude "/plan"',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    },
    {
        id: 3,
        title: 'PRD',
        description: 'Crie um Product Requirements Document completo baseado no brainstorming e plano.',
        buttonLabel: 'Gerar PRD',
        terminalCommand: 'claude "Gere um arquivo prd.md completo baseado no design document e no plano de implementação discutidos anteriormente. Inclua: objetivo, escopo, requisitos funcionais e não-funcionais, critérios de aceite e métricas de sucesso. Salve em docs/prd.md"',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    },
    {
        id: 4,
        title: 'Issues',
        description: 'Gere estrutura de issues organizadas em épicos, tasks e subtasks.',
        buttonLabel: 'Gerar Issues',
        terminalCommand: 'claude "Gere estrutura de issues em épicos > tasks > subtasks baseado no PRD (docs/prd.md). Para cada issue inclua: título, descrição, critérios de aceite e labels sugeridas. Salve em docs/issues.md"',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    },
    {
        id: 5,
        title: 'Criar no Jira',
        description: 'Crie automaticamente todas as issues no Jira a partir do arquivo gerado.',
        buttonLabel: 'Criar Issues no Jira',
        terminalCommand: '', // handled specially via showInputBox
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    },
];
