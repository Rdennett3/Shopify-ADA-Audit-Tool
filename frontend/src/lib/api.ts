import type {
    ReportSummary,
    ScanJob,
} from "@/lib/types";

const API_BASE_URL =
    process.env.API_BASE_URL ?? "http://localhost:3000";

export async function getJobs(): Promise<ScanJob[]> {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch jobs: ${res.status}`);
    }

    return res.json();
}

export async function getReportSummary(
    id: string
): Promise<ReportSummary> {
    const res = await fetch(
        `${API_BASE_URL}/report/${encodeURIComponent(id)}/summary`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch report summary: ${res.status}`);
    }

    return res.json();
}

export async function getReportPages(id: string) {
    const res = await fetch(
        `${API_BASE_URL}/report/${encodeURIComponent(id)}/pages`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch report pages: ${res.status}`);
    }

    return res.json();
}

export async function getReportPage(id: string, url: string) {
    const encodedUrl = encodeURIComponent(url);

    const res = await fetch(
        `${API_BASE_URL}/report/${encodeURIComponent(id)}/page?url=${encodedUrl}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch report page: ${res.status}`);
    }

    return res.json();
}