const { ObjectId } = require("mongodb");

function createReportService(db) {

    async function getJob(id) {

        if (
            typeof id !== "string" ||
            !ObjectId.isValid(id)
        ) {
            console.warn("Invalid job ID:", id);
            return null;
        }

        return await db.collection("jobs").findOne({
            _id: new ObjectId(id)
        });
    }

    async function getLatestJobs(limit = 20) {
        return await db.collection("jobs")
            .find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .project({
                _id: 1,
                url: 1,
                status: 1,
                createdAt: 1,
                "results.summary": 1,
                "results.lighthouse": 1
            })
            .toArray();
    }

    async function getSummary(id) {
        const job = await getJob(id);

        if (!job) return null;

        return {
            id: job._id,
            url: job.url,
            status: job.status,
            createdAt: job.createdAt,
            coverage: job.results?.coverage || null,
            summary: job.results?.summary || null,
            lighthouse: job.results?.lighthouse || null
        };
    }

    async function getPages(id) {
        const job = await getJob(id);

        if (!job || !job.results?.pages) return null;

        return job.results.pages.map(page => ({
            url: page.url,
            type: page.type,
            violations: page.violations
        }));
    }

    async function getPageByUrl(id, url) {
        const job = await getJob(id);

        if (!job || !job.results?.pages) return null;

        return job.results.pages.find(page => page.url === url) || null;
    }

    return {
        getJob,
        getLatestJobs,
        getSummary,
        getPages,
        getPageByUrl
    };
}

module.exports = createReportService;