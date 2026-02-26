export interface CategoryScore {
    name: string;
    score: number;
    justification: string;
}

export interface CodeReviewResult {
    path: string;
    timestamp: number;
    durationMs: number;
    qualityScores: CategoryScore[];
    securityScores: CategoryScore[];
    qualityAvg: number;
    securityAvg: number;
    finalScore: number;
    criticalProblems: string[];
    recommendations: string[];
    rawOutput: string;
}
