export interface ItemProgress {
    name: string;
    status: 'pending' | 'active' | 'done';
    score?: number;
}

export interface AnalysisProgress {
    phase: 'reading' | 'quality' | 'security' | 'summary';
    phaseLabel: string;
    qualityItems: ItemProgress[];
    securityItems: ItemProgress[];
    completedCount: number;
    totalCount: number;
    currentActivity: string;
}

export const QUALITY_CATEGORIES = [
    'Clean Code & Legibilidade',
    'SOLID',
    'DRY & Reutilização',
    'Tratamento de Erros',
    'Performance',
    'Testabilidade',
    'Arquitetura & Padrões',
];

export const SECURITY_CATEGORIES = [
    'Injection',
    'XSS',
    'Auth & Autorização',
    'Dados Sensíveis',
    'Dependências',
    'OWASP Top 10',
    'Config Segurança',
];

const CATEGORY_ALIASES: Record<string, string[]> = {
    'Clean Code & Legibilidade': ['clean code', 'legibilidade'],
    'SOLID': ['princípios solid', 'principios solid', 'single responsibility'],
    'DRY & Reutilização': ['dry', 'reutilização', 'reutilizacao'],
    'Tratamento de Erros': ['tratamento de erros', 'error handling', 'tratamento de erro'],
    'Performance': ['performance', 'desempenho', 'complexidade algorítmica'],
    'Testabilidade': ['testabilidade', 'testability'],
    'Arquitetura & Padrões': ['arquitetura', 'padrões de projeto', 'design pattern'],
    'Injection': ['injection', 'injeção', 'sql injection', 'nosql injection', 'command injection'],
    'XSS': ['xss', 'cross-site scripting', 'cross site scripting'],
    'Auth & Autorização': ['autenticação', 'autenticacao', 'autorização', 'autorizacao', 'auth &'],
    'Dados Sensíveis': ['dados sensíveis', 'dados sensiveis', 'sensitive data', 'secrets hardcoded'],
    'Dependências': ['dependências', 'dependencias', 'pacotes vulneráveis', 'pacotes vulneraveis'],
    'OWASP Top 10': ['owasp'],
    'Config Segurança': ['config segurança', 'config seguranca', 'configuração de segurança', 'configuracao de seguranca'],
};

function findCategoryInText(
    lowerOutput: string,
    originalOutput: string,
    categoryName: string,
): { found: boolean; hasScore: boolean; score?: number } {
    const aliases = CATEGORY_ALIASES[categoryName] ?? [categoryName.toLowerCase()];

    for (const alias of aliases) {
        const idx = lowerOutput.indexOf(alias);
        if (idx === -1) { continue; }

        const nearbyText = originalOutput.substring(idx, Math.min(idx + 500, originalOutput.length));
        const scoreMatch = nearbyText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);

        if (scoreMatch) {
            return { found: true, hasScore: true, score: parseFloat(scoreMatch[1]) };
        }

        return { found: true, hasScore: false };
    }

    return { found: false, hasScore: false };
}

function markSequentialProgress(items: ItemProgress[]): void {
    let lastActiveIdx = -1;
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].status === 'active') {
            if (lastActiveIdx === -1) {
                lastActiveIdx = i;
            } else {
                items[i].status = 'done';
            }
        }
    }
}

export function detectProgress(accumulatedOutput: string): AnalysisProgress {
    // toLowerCase once, reuse everywhere
    const lower = accumulatedOutput.toLowerCase();

    const qualityItems: ItemProgress[] = QUALITY_CATEGORIES.map((name) => {
        const { found, hasScore, score } = findCategoryInText(lower, accumulatedOutput, name);
        return {
            name,
            status: hasScore ? 'done' as const : found ? 'active' as const : 'pending' as const,
            score: hasScore ? score : undefined,
        };
    });

    const securityItems: ItemProgress[] = SECURITY_CATEGORIES.map((name) => {
        const { found, hasScore, score } = findCategoryInText(lower, accumulatedOutput, name);
        return {
            name,
            status: hasScore ? 'done' as const : found ? 'active' as const : 'pending' as const,
            score: hasScore ? score : undefined,
        };
    });

    markSequentialProgress(qualityItems);
    markSequentialProgress(securityItems);

    const completedCount = [...qualityItems, ...securityItems].filter(
        (i) => i.status === 'done',
    ).length;

    const hasQualityContent = qualityItems.some((i) => i.status !== 'pending');
    const hasSecurityContent = securityItems.some((i) => i.status !== 'pending');
    const hasSummary =
        lower.includes('resumo final') ||
        lower.includes('scores_json') ||
        lower.includes('nota final');

    let phase: AnalysisProgress['phase'] = 'quality';
    let phaseLabel = 'Analisando Qualidade do Código';

    if (hasSummary) {
        phase = 'summary';
        phaseLabel = 'Gerando resumo e notas finais';
    } else if (hasSecurityContent) {
        phase = 'security';
        phaseLabel = 'Análise de Segurança';
    } else if (hasQualityContent) {
        phase = 'quality';
        phaseLabel = 'Análise de Qualidade do Código';
    }

    let currentActivity = 'Analisando o código...';
    if (phase === 'summary') {
        currentActivity = 'Compilando resultados e gerando relatório...';
    } else {
        const allItems = [...qualityItems, ...securityItems];
        const activeItem = allItems.find((i) => i.status === 'active');
        if (activeItem) {
            currentActivity = `Analisando: ${activeItem.name}`;
        } else if (completedCount > 0) {
            currentActivity = `${completedCount} de 14 critérios analisados`;
        }
    }

    return {
        phase,
        phaseLabel,
        qualityItems,
        securityItems,
        completedCount,
        totalCount: 14,
        currentActivity,
    };
}
