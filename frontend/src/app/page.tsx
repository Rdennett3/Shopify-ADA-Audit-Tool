import { getJobs } from "@/lib/api";

export default async function HomePage() {
  const jobs = await getJobs();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold mb-2">
          Shopify ADA Audit Dashboard
        </h1>

        <p className="text-gray-600 mb-8">
          Recent accessibility scans
        </p>

        <div className="overflow-hidden rounded-lg border bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-4">Website</th>
                <th className="p-4">Status</th>
                <th className="p-4">Pages</th>
                <th className="p-4">Violations</th>
                <th className="p-4">Accessibility</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job: any) => (
                <tr
                  key={job._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {job.url}
                  </td>

                  <td className="p-4">
                    {job.status}
                  </td>

                  <td className="p-4">
                    {job.results?.summary?.pagesScanned ?? "-"}
                  </td>

                  <td className="p-4">
                    {job.results?.summary?.totalViolations ?? "-"}
                  </td>

                  <td className="p-4">
                    {job.results?.lighthouse
                      ? `${Math.round(
                        job.results.lighthouse.accessibility * 100
                      )}%`
                      : "-"}
                  </td>

                  <td className="p-4">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}