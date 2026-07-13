const API_BASE_URL = "http://localhost:3000";

export async function getJobs() {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return res.json();
}

export async function getReportSummary(id: string) {
    const res = await fetch(`${API_BASE_URL}/report/${id}/summary`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch report summary");
    }

    return res.json();
}

export async function getReportPages(id: string) {
    const res = await fetch(`${API_BASE_URL}/report/${id}/pages`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch report pages");
    }

    return res.json();
}

export async function getReportPage(id: string, url: string) {
    const encodedUrl = encodeURIComponent(url);

    const res = await fetch(`${API_BASE_URL}/report/${id}/page?url=${encodedUrl}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch report page");
    }

    return res.json();
}