import {
    type CategoryScore,
    type CodeReviewResult,
} from '../models/codeReviewResult';

const QUALITY_CATEGORIES = [
    'Clean Code & Legibilidade',
    'SOLID',
    'DRY & Reutilização',
    'Tratamento de Erros',
    'Performance',
    'Testabilidade',
    'Arquitetura & Padrões',
];

const SECURITY_CATEGORIES = [
    'Injection',
    'XSS',
    'Auth & Autorização',
    'Dados Sensíveis',
    'Dependências',
    'OWASP Top 10',
    'Config Segurança',
];

function clamp(value: number): number {
    return Math.round(Math.min(10, Math.max(0, value)) * 10) / 10;
}

function avg(scores: CategoryScore[]): number {
    if (scores.length === 0) { return 0; }
    const sum = scores.reduce((acc, s) => acc + s.score, 0);
    return clamp(sum / scores.length);
}

function tryParseJson(output: string): Partial<CodeReviewResult> | null {
    const match = output.match(/<!--\s*SCORES_JSON\s*([\s\S]*?)-->/);
    if (!match) { return null; }

    try {
        const json = JSON.parse(match[1].trim());

        const qualityScores: CategoryScore[] = (json.qualityScores ?? []).map(
            (s: { name?: string; score?: number; justification?: string }) => ({
                name: s.name ?? '',
                score: clamp(Number(s.score) || 0),
                justification: s.justification ?? '',
            }),
        );

        const securityScores: CategoryScore[] = (json.securityScores ?? []).map(
            (s: { name?: string; score?: number; justification?: string }) => ({
                name: s.name ?? '',
                score: clamp(Number(s.score) || 0),
                justification: s.justification ?? '',
            }),
        );

        return {
            qualityScores,
            securityScores,
            qualityAvg: clamp(Number(json.qualityAvg) || avg(qualityScores)),
            securityAvg: clamp(Number(json.securityAvg) || avg(securityScores)),
            finalScore: clamp(Number(json.finalScore) || 0),
            criticalProblems: Array.isArray(json.criticalProblems) ? json.criticalProblems : [],
            recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
        };
    } catch {
        return null;
    }
}

function parseScoreFromLine(line: string): number {
    // Handle bold markdown around scores: **8**/10, **8.5**/10, 8/10, 8.5/10
    const m = line.match(/(\d+(?:\.\d+)?)\s*\*{0,2}\s*\/\s*10/);
    return m ? clamp(Number(m[1])) : 0;
}

function matchCategory(line: string, categories: string[]): string | null {
    const lower = line.toLowerCase();
    for (const cat of categories) {
        if (lower.includes(cat.toLowerCase())) {
            return cat;
        }
    }
    return null;
}

function extractList(output: string, headerPattern: RegExp): string[] {
    const items: string[] = [];
    const match = output.match(headerPattern);
    if (!match) { return items; }

    const startIdx = match.index! + match[0].length;
    const rest = output.substring(startIdx);
    const lines = rest.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) { break; }
        const bullet = trimmed.match(/^[-*\d.]+\s*\.?\s*\*{0,2}(.+)/);
        if (bullet) {
            items.push(bullet[1].replace(/\*{1,2}/g, '').trim());
        }
    }
    return items;
}

function tryParseMarkdown(output: string): Partial<CodeReviewResult> {
    const qualityScores: CategoryScore[] = [];
    const securityScores: CategoryScore[] = [];

    const lines = output.split('\n');
    for (const line of lines) {
        if (!line.includes('/10')) { continue; }

        const qCat = matchCategory(line, QUALITY_CATEGORIES);
        if (qCat) {
            qualityScores.push({
                name: qCat,
                score: parseScoreFromLine(line),
                justification: line.replace(/\|/g, '').trim(),
            });
            continue;
        }

        const sCat = matchCategory(line, SECURITY_CATEGORIES);
        if (sCat) {
            securityScores.push({
                name: sCat,
                score: parseScoreFromLine(line),
                justification: line.replace(/\|/g, '').trim(),
            });
        }
    }

    // Try to extract explicit averages from the output (e.g., "NOTA GERAL DE QUALIDADE: 5.9/10")
    let qualityAvg = avg(qualityScores);
    let securityAvg = avg(securityScores);
    let finalScore = clamp(qualityAvg * 0.4 + securityAvg * 0.6);

    for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.includes('nota') && lower.includes('qualidade') && line.includes('/10')) {
            const explicit = parseScoreFromLine(line);
            if (explicit > 0) { qualityAvg = explicit; }
        } else if (lower.includes('nota') && lower.includes('seguran') && line.includes('/10')) {
            const explicit = parseScoreFromLine(line);
            if (explicit > 0) { securityAvg = explicit; }
        } else if (lower.includes('nota final') && line.includes('/10')) {
            const explicit = parseScoreFromLine(line);
            if (explicit > 0) { finalScore = explicit; }
        }
    }

    const criticalProblems = extractList(output, /###?\s*TOP\s*3\s*PROBLEMAS\s*CR[ÍI]TICOS/i);
    const recommendations = extractList(output, /###?\s*RECOMENDA[ÇC][ÕO]ES\s*PRIORIT[ÁA]RIAS/i);

    return {
        qualityScores,
        securityScores,
        qualityAvg,
        securityAvg,
        finalScore,
        criticalProblems,
        recommendations,
    };
}

export function parseCodeReviewOutput(
    output: string,
    path: string,
    durationMs: number,
): CodeReviewResult {
    const base: CodeReviewResult = {
        path,
        timestamp: Date.now(),
        durationMs,
        qualityScores: [],
        securityScores: [],
        qualityAvg: 0,
        securityAvg: 0,
        finalScore: 0,
        criticalProblems: [],
        recommendations: [],
        rawOutput: output,
    };

    const jsonResult = tryParseJson(output);
    if (jsonResult && (jsonResult.qualityScores?.length || jsonResult.securityScores?.length)) {
        return { ...base, ...jsonResult };
    }

    const mdResult = tryParseMarkdown(output);
    return { ...base, ...mdResult };
}
