import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportPage } from "@/lib/api";

function severityClass(severity?: string) {
    switch (severity?.toLowerCase()) {
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

export default async function PageFindingsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ url?: string }>;
}) {
    const { id } = await params;
    const { url } = await searchParams;

    if (!url) {
        notFound();
    }

    let report;

    try {
        report = await getReportPage(id, url);
    } catch {
        notFound();
    }

    const issues = report.issues ?? [];

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-wrap gap-4">
                    <Link
                        href={`/scan/${id}/pages`}
                        className="text-sm font-medium text-blue-700 hover:underline main-btn"
                    >
                        Back to scanned pages
                    </Link>

                    <Link
                        href={`/scan/${id}`}
                        className="text-sm font-medium text-blue-700 hover:underline main-btn"
                    >
                        Report overview
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {report.type} page
                    </p>

                    <h1 className="mt-2 break-all text-2xl font-bold text-slate-950">
                        {report.url}
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <a
                            href={report.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Open live page
                        </a>

                        <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                            {report.violations} violation types
                        </span>
                    </div>
                </div>

                <section className="mt-8">
                    <h2 className="mb-4 text-2xl font-bold text-slate-950">
                        Accessibility findings
                    </h2>

                    <div className="space-y-5">
                        {issues.map((issue) => (
                            <article
                                key={issue.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-950">
                                            {issue.title ?? issue.id}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {issue.wcag ?? "WCAG mapping unavailable"}
                                            {issue.level ? ` · Level ${issue.level}` : ""}
                                        </p>
                                        <Link
                                            href={
                                                `/scan/${id}/inspect` +
                                                `?url=${encodeURIComponent(report.url)}` +
                                                `&issue=${encodeURIComponent(issue.id)}`
                                            }
                                            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                                        >
                                            Inspect affected elements
                                        </Link>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClass(
                                            issue.severity ?? issue.impact
                                        )}`}
                                    >
                                        {issue.severity ?? issue.impact ?? "Unknown"}
                                    </span>
                                </div>

                                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">
                                            Occurrences
                                        </dt>
                                        <dd className="mt-1 text-2xl font-bold text-slate-950">
                                            {issue.count}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">
                                            Axe rule
                                        </dt>
                                        <dd className="mt-1 font-mono text-sm text-slate-800">
                                            {issue.id}
                                        </dd>
                                    </div>
                                </dl>

                                {issue.description && (
                                    <div className="mt-5">
                                        <h4 className="text-sm font-semibold text-slate-950">
                                            What was detected
                                        </h4>

                                        <p className="mt-1 text-sm leading-6 text-slate-700">
                                            {issue.description}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5">
                                    <h4 className="text-sm font-semibold text-slate-950">
                                        Recommended remediation
                                    </h4>

                                    <p className="mt-1 text-sm leading-6 text-slate-700">
                                        {issue.recommendation ??
                                            "A recommendation was not stored for this older scan."}
                                    </p>
                                </div>
                            </article>
                        ))}

                        {issues.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
                                No accessibility issues were stored for this page.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}   