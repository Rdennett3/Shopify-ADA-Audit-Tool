import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportPages } from "@/lib/api";

function typeClass(type: string) {
    switch (type.toLowerCase()) {
        case "product":
            return "bg-blue-100 text-blue-800";
        case "collection":
            return "bg-purple-100 text-purple-800";
        case "home":
            return "bg-green-100 text-green-800";
        case "blog":
            return "bg-orange-100 text-orange-800";
        case "page":
            return "bg-slate-100 text-slate-800";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default async function ScannedPagesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let pages;

    try {
        pages = await getReportPages(id);
    } catch {
        notFound();
    }

    const sortedPages = [...pages].sort(
        (a, b) => b.violations - a.violations
    );

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap gap-4">
                    <Link
                        href={`/scan/${id}`}
                        className="text-sm font-medium text-blue-700 hover:underline main-btn"
                    >
                        Back to report
                    </Link>

                    <Link
                        href="/"
                        className="text-sm font-medium text-blue-700 hover:underline main-btn"
                    >
                        Back to scans
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-950">
                        Scanned Pages
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {pages.length} pages included in this audit
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm text-slate-600">
                                    <th className="px-5 py-4 font-semibold">Page</th>
                                    <th className="px-5 py-4 font-semibold">Type</th>
                                    <th className="px-5 py-4 font-semibold">
                                        Violation types
                                    </th>
                                    <th className="px-5 py-4">
                                        <span className="sr-only">View page findings</span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedPages.map((page) => {
                                    const detailUrl =
                                        `/scan/${id}/page?url=${encodeURIComponent(page.url)}`;

                                    return (
                                        <tr
                                            key={page.url}
                                            className="border-t border-slate-200 text-sm hover:bg-slate-50"
                                        >
                                            <td className="max-w-xl px-5 py-4">
                                                <a
                                                    href={page.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="break-all font-medium text-slate-950 hover:underline"
                                                >
                                                    {page.url}
                                                </a>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${typeClass(
                                                        page.type
                                                    )}`}
                                                >
                                                    {page.type}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 font-semibold">
                                                {page.violations}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={detailUrl}
                                                    className="font-medium text-blue-700 hover:underline"
                                                >
                                                    View findings
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {pages.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            No stored page results are available for this scan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}