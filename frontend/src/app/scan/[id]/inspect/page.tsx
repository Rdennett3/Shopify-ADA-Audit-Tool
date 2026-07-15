import Link from "next/link";
import { inspectIssue } from "@/lib/api";

function severityClass(impact?: string) {
    switch (impact?.toLowerCase()) {
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

function formatTarget(target: string[] | string) {
    return Array.isArray(target)
        ? target.join(" → ")
        : target;
}

export default async function InspectionPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        url?: string;
        issue?: string;
    }>;
}) {
    const { id } = await params;
    const { url, issue } = await searchParams;

    if (!url || !issue) {
        return (
            <main className="min-h-screen px-6 py-10">
                <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-950">
                        Inspection parameters are missing
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Both a page URL and Axe issue ID are required.
                    </p>

                    <Link
                        href={`/scan/${id}`}
                        className="mt-5 inline-flex text-blue-700 hover:underline"
                    >
                        Return to report
                    </Link>
                </div>
            </main>
        );
    }

    let inspection;
    let inspectionError: string | null = null;

    try {
        inspection = await inspectIssue(url, issue);
    } catch (error) {
        inspectionError =
            error instanceof Error
                ? error.message
                : "The live inspection failed.";
    }

    if (!inspection || inspectionError) {
        return (
            <main className="min-h-screen bg-slate-100 px-6 py-10">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={
                            `/scan/${id}/page?url=${encodeURIComponent(url)}`
                        }
                        className="text-sm font-medium text-blue-700 hover:underline main-btn"
                    >
                        ← Back to page findings
                    </Link>

                    <div className="mt-6 rounded-xl border border-orange-200 bg-white p-8 shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-950">
                            Live inspection unavailable
                        </h1>

                        <p className="mt-3 text-slate-700">
                            {inspectionError}
                        </p>

                        <p className="mt-3 text-sm text-slate-500">
                            The live page may have changed since the stored scan was
                            completed, or the issue may only appear under certain
                            page conditions.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-wrap gap-4">
                    <Link
                        href={
                            `/scan/${id}/page?url=${encodeURIComponent(url)}`
                        }
                        className="text-sm font-medium text-blue-700 hover:underline"
                    >
                        ← Back to page findings
                    </Link>

                    <Link
                        href={`/scan/${id}`}
                        className="text-sm font-medium text-blue-700 hover:underline"
                    >
                        Report overview
                    </Link>
                </div>

                <header className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Live element inspection
                            </p>

                            <h1 className="mt-2 text-3xl font-bold text-slate-950">
                                {inspection.issue}
                            </h1>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${severityClass(
                                inspection.impact
                            )}`}
                        >
                            {inspection.impact ?? "Unknown impact"}
                        </span>
                    </div>

                    <p className="mt-5 break-all text-sm text-slate-600">
                        {inspection.url}
                    </p>

                    {inspection.description && (
                        <p className="mt-4 leading-7 text-slate-700">
                            {inspection.description}
                        </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                        <a
                            href={inspection.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Open live page
                        </a>

                        {inspection.helpUrl && (
                            <a
                                href={inspection.helpUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                View Axe guidance
                            </a>
                        )}
                    </div>
                </header>

                <section className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-slate-950">
                            Triggering elements
                        </h2>

                        <p className="mt-1 text-slate-600">
                            {inspection.nodes.length} element
                            {inspection.nodes.length === 1 ? "" : "s"} returned by
                            the live inspection
                        </p>
                    </div>

                    <div className="space-y-5">
                        {inspection.nodes.map((node, index) => (
                            <article
                                key={`${formatTarget(node.target)}-${index}`}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-semibold text-slate-950">
                                        Element {index + 1}
                                    </h3>
                                </div>

                                <div className="mt-5">
                                    <h4 className="text-sm font-semibold text-slate-950">
                                        CSS selector
                                    </h4>

                                    <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
                                        {formatTarget(node.target)}
                                    </code>
                                </div>

                                <div className="mt-5">
                                    <h4 className="text-sm font-semibold text-slate-950">
                                        HTML
                                    </h4>

                                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
                                        <code>{node.html}</code>
                                    </pre>
                                </div>

                                {node.failureSummary && (
                                    <div className="mt-5">
                                        <h4 className="text-sm font-semibold text-slate-950">
                                            Why this element failed
                                        </h4>

                                        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                                            {node.failureSummary}
                                        </pre>
                                    </div>
                                )}
                            </article>
                        ))}

                        {inspection.nodes.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
                                Axe reported the issue but returned no element details.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}