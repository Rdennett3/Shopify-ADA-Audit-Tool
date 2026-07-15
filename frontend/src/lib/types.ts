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
    coverage?: ScanCoverage | null;
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

export interface PageListItem {
    url: string;
    type: string;
    violations: number;
}

export interface PageIssue {
    id: string;
    impact?: string;
    description?: string;
    help?: string;
    count: number;
    title?: string;
    wcag?: string;
    level?: string;
    severity?: string;
    recommendation?: string;
}

export interface PageReport {
    url: string;
    type: string;
    violations: number;
    issues: PageIssue[];
}

export interface InspectionNode {
    target: string[] | string;
    html: string;
    failureSummary?: string;
}

export interface InspectionResult {
    url: string;
    issue: string;
    impact?: string;
    description?: string;
    help?: string;
    helpUrl?: string;
    nodes: InspectionNode[];
}

export interface ScanCoverage {
    scanMode: "sample" | "full";
    pagesDiscovered: number;
    pagesScanned: number;
    sitemapCount: number;
}