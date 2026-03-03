export interface StageInfo {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

export const STAGES: StageInfo[] = [
    {
        id: 'produto',
        title: 'Produto',
        description: 'Ideação, requisitos e planejamento',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 4 12.9V17H8v-2.1A7 7 0 0 1 12 2z"/></svg>`,
        color: '#f59e0b',
    },
    {
        id: 'desenvolvimento',
        title: 'Desenvolvimento',
        description: 'Codificação e implementação',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>`,
        color: '#3b82f6',
    },
    {
        id: 'versionamento',
        title: 'Versionamento',
        description: 'Git Flow: branches, merges e limpeza',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
        color: '#8b5cf6',
    },
    {
        id: 'qa',
        title: 'QA',
        description: 'Testes e validação de qualidade',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
        color: '#10b981',
    },
];
