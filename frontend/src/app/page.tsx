import Link from "next/link";
import { getJobs } from "@/lib/api";
import type { ScanJob } from "@/lib/types";

function formatScore(score?: number) {
  return typeof score === "number"
    ? `${Math.round(score * 100)}%`
    : "—";
}

export default async function HomePage() {
  const jobs: ScanJob[] = await getJobs();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Shopify ADA Audit Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Recent accessibility scans
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-5 py-4">Website</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Pages</th>
                <th className="px-5 py-4">Violations</th>
                <th className="px-5 py-4">Accessibility</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {job.url}
                  </td>

                  <td className="px-5 py-4 capitalize">
                    {job.status}
                  </td>

                  <td className="px-5 py-4">
                    {job.results?.summary?.pagesScanned ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    {job.results?.summary?.totalViolations ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    {formatScore(
                      job.results?.lighthouse?.accessibility
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/scan/${job._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Report →
                    </Link>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No scans have been run yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}