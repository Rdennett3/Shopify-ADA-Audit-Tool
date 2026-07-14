import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportSummary } from "@/lib/api";

function scorePercent(score?: number | null) {
    return typeof score === "number"
        ? Math.round(score * 100)
        : null;
}

function scoreDisplay(score?: number | null) {
    const percent = scorePercent(score);
    return percent === null ? "—" : `${percent}%`;
}

function severityClass(severity: string) {
    switch (severity.toLowerCase()) {
        case "critical":
            return "bg-red-100 text-red-800";
        case "serious":
            return "bg-orange-100 text-orange-800";
        case "moderate":
            return "bg-yellow-100 text-yellow-800";
        case "minor":
            return "bg-blue-100 text-blue-800";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

export default async function ScanDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let report;

    try {
        report = await getReportSummary(id);
    } catch {
        notFound();
    }

    const summary = report.summary;
    const lighthouse = report.lighthouse;

    const topIssues = summary?.topIssues ?? [];
    const templates = summary?.templates ?? [];

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/"
                    replace
                    className="mb-6 inline-flex text-sm font-medium text-blue-700 hover:underline"
                >
                    ← Back to scans
                </Link>

                <div className="mb-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Accessibility report
                            </p>

                            <h1 className="mt-1 break-all text-3xl font-bold text-slate-950">
                                {report.url}
                            </h1>

                            <p className="mt-2 text-sm text-slate-600">
                                Scan created{" "}
                                {new Date(report.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold capitalize text-slate-700 shadow-sm">
                            {report.status}
                        </span>
                    </div>
                </div>

                {!summary ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-950">
                            Scan in progress
                        </h2>

                        <p className="mt-2 text-slate-600">
                            The summary will appear after the worker finishes the scan.
                        </p>
                    </div>
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                label="Pages scanned"
                                value={summary.pagesScanned}
                            />

                            <MetricCard
                                label="Pages with issues"
                                value={summary.pagesWithIssues}
                            />

                            <MetricCard
                                label="Violation types"
                                value={summary.totalViolations}
                            />

                            <MetricCard
                                label="Lighthouse accessibility"
                                value={scoreDisplay(lighthouse?.accessibility)}
                            />
                        </section>

                        <section className="mt-8">
                            <h2 className="mb-4 text-2xl font-bold text-slate-950">
                                Lighthouse scores
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <ScoreCard
                                    label="Accessibility"
                                    score={lighthouse?.accessibility}
                                />
                                <ScoreCard
                                    label="Performance"
                                    score={lighthouse?.performance}
                                />
                                <ScoreCard label="SEO" score={lighthouse?.seo} />
                                <ScoreCard
                                    label="Best practices"
                                    score={lighthouse?.bestPractices}
                                />
                            </div>
                        </section>

                        <section className="mt-8">
                            <h2 className="mb-4 text-2xl font-bold text-slate-950">
                                Top accessibility issues
                            </h2>

                            <div className="space-y-4">
                                {topIssues.map((issue) => (
                                    <article
                                        key={issue.id}
                                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-950">
                                                    {issue.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-600">
                                                    {issue.wcag} · Level {issue.level}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClass(
                                                    issue.severity
                                                )}`}
                                            >
                                                {issue.severity}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-6 text-sm">
                                            <p>
                                                <strong>{issue.count}</strong> occurrences
                                            </p>

                                            <p>
                                                <strong>{issue.affectedPages}</strong> affected pages
                                            </p>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-slate-700">
                                            {issue.recommendation}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="mt-8">
                            <h2 className="mb-4 text-2xl font-bold text-slate-950">
                                Template findings
                            </h2>

                            <div className="grid gap-5 lg:grid-cols-2">
                                {templates.map((template) => (
                                    <article
                                        key={template.template}
                                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                                    >
                                        <h3 className="text-xl font-semibold capitalize text-slate-950">
                                            {template.template} template
                                        </h3>

                                        <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <dt className="text-slate-500">Scanned</dt>
                                                <dd className="mt-1 text-xl font-bold">
                                                    {template.pagesScanned}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className="text-slate-500">
                                                    With issues
                                                </dt>
                                                <dd className="mt-1 text-xl font-bold">
                                                    {template.pagesWithIssues}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className="text-slate-500">
                                                    Violations
                                                </dt>
                                                <dd className="mt-1 text-xl font-bold">
                                                    {template.totalViolations}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="mt-5">
                                            <h4 className="text-sm font-semibold text-slate-950">
                                                Top template issues
                                            </h4>

                                            <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                                {(template.issues ?? []).slice(0, 4).map((issue) => (
                                                    <li
                                                        key={issue.id}
                                                        className="flex justify-between gap-4"
                                                    >
                                                        <span>{issue.title}</span>
                                                        <span className="font-medium">
                                                            {issue.count}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {(template.examplePages ?? []).length > 0 && (
                                            <div className="mt-5">
                                                <h4 className="text-sm font-semibold text-slate-950">
                                                    Example pages
                                                </h4>

                                                <ul className="mt-2 space-y-1">
                                                    {(template.examplePages ?? []).slice(0, 3).map((url) => (
                                                        <li key={url}>
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="break-all text-sm text-blue-700 hover:underline"
                                                            >
                                                                {url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

function MetricCard({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
    );
}

function ScoreCard({
    label,
    score,
}: {
    label: string;
    score?: number | null;
}) {
    const percent = scorePercent(score);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
                {percent === null ? "—" : `${percent}%`}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full rounded-full bg-slate-800"
                    style={{ width: `${percent ?? 0}%` }}
                />
            </div>
        </div>
    );
}