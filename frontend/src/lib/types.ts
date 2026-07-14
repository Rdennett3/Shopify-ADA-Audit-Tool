export interface TopIssue {
    id: string;
    title: string;
    wcag: string;
    level: string;
    severity: string;
    recommendation: string;
    count: number;
    affectedPages: number;
}

export interface TemplateSummary {
    template: string;
    pagesScanned: number;
    pagesWithIssues: number;
    totalViolations: number;
    examplePages: string[];
    issues: TopIssue[];
}

export interface ScanSummary {
    pagesScanned: number;
    pagesWithIssues: number;
    totalViolations: number;
    topIssues: TopIssue[];
    templates: TemplateSummary[];
}

export interface LighthouseScores {
    accessibility: number;
    performance: number;
    seo: number;
    bestPractices: number;
}

export interface ReportSummary {
    id: string;
    url: string;
    status: string;
    createdAt: string;
    summary: ScanSummary | null;
    lighthouse: LighthouseScores | null;
}

export interface ScanJob {
    _id: string;
    url: string;
    status: string;
    createdAt: string;
    results?: {
        summary?: ScanSummary;
        lighthouse?: LighthouseScores;
    };
}