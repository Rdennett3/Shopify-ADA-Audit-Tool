const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URL);
let db;

async function connect() {
    await client.connect();
    db = client.db("ada");
}

connect();

// Create scan job
app.post("/scan", async (req, res) => {
    const { url } = req.body;

    const result = await db.collection("jobs").insertOne({
        url,
        status: "queued",
        createdAt: new Date()
    });

    res.json({ jobId: result.insertedId });
});

// Get results
app.get("/scan/:id", async (req, res) => {
    try {
        const { ObjectId } = require("mongodb");

        const job = await db.collection("jobs").findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(job);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

app.get("/report/:id", async (req, res) => {
    const { ObjectId } = require("mongodb");

    const job = await db.collection("jobs").findOne({
        _id: new ObjectId(req.params.id)
    });

    console.log("JOB FOUND:", !!job);

    if (job) {
        console.log("JOB KEYS:", Object.keys(job));
        console.log("HAS RESULTS:", !!job.results);
    }

    res.json(job);
});

app.get("/jobs", async (req, res) => {
    const jobs = await db.collection("jobs")
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

    res.json(jobs);
});

app.get("/report/:id/summary", async (req, res) => {
    try {
        const { ObjectId } = require("mongodb");

        const job = await db.collection("jobs").findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!job) {
            return res.status(404).json({
                error: "Report not found"
            });
        }

        res.json({
            id: job._id,
            url: job.url,
            status: job.status,
            createdAt: job.createdAt,
            summary: job.results?.summary || null,
            lighthouse: job.results?.lighthouse || null
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
});

app.get("/report/:id/html", async (req, res) => {
    try {
        const { ObjectId } = require("mongodb");

        const job = await db.collection("jobs").findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!job || !job.results) {
            return res.status(404).send("Report not found");
        }

        const { summary, lighthouse } = job.results;

        const topIssuesHtml = (summary.topIssues || []).map(issue => `
            <tr>
                <td>${issue.title || issue.id}</td>
                <td>${issue.wcag || "Unmapped"}</td>
                <td>${issue.level || "Unknown"}</td>
                <td>${issue.severity || "Unknown"}</td>
                <td>${issue.count}</td>
                <td>${issue.affectedPages}</td>
                <td>${issue.recommendation || ""}</td>
            </tr>
        `).join("");

        const templatesHtml = (summary.templates || []).map(template => `
            <section class="card">
                <h2>${template.template} template</h2>
                <p><strong>Pages scanned:</strong> ${template.pagesScanned}</p>
                <p><strong>Pages with issues:</strong> ${template.pagesWithIssues}</p>
                <p><strong>Total violations:</strong> ${template.totalViolations}</p>

                <h3>Example pages</h3>
                <ul>
                    ${(template.examplePages || []).map(url => `
                        <li><a href="${url}" target="_blank">${url}</a></li>
                    `).join("")}
                </ul>

                <h3>Issues</h3>
                <ul>
                    ${(template.issues || []).map(issue => `
                        <li>
                            <strong>${issue.title || issue.id}</strong>
                            — ${issue.count} occurrences across ${issue.affectedPages} pages
                        </li>
                    `).join("")}
                </ul>
            </section>
        `).join("");

        res.send(`
            <!doctype html>
            <html>
            <head>
                <title>ADA Audit Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        color: #222;
                        line-height: 1.5;
                    }
                    h1, h2, h3 {
                        color: #111;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 16px;
                        margin: 24px 0;
                    }
                    .card {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 24px;
                        background: #fff;
                    }
                    .metric {
                        font-size: 28px;
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 16px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                        vertical-align: top;
                    }
                    th {
                        background: #f5f5f5;
                    }
                    a {
                        color: #0645ad;
                    }
                </style>
            </head>
            <body>
                <h1>ADA Audit Report</h1>
                <p><strong>Site:</strong> ${job.url}</p>
                <p><strong>Scan date:</strong> ${job.createdAt}</p>

                <div class="grid">
                    <div class="card">
                        <div class="metric">${summary.pagesScanned}</div>
                        <div>Pages scanned</div>
                    </div>
                    <div class="card">
                        <div class="metric">${summary.pagesWithIssues}</div>
                        <div>Pages with issues</div>
                    </div>
                    <div class="card">
                        <div class="metric">${summary.totalViolations}</div>
                        <div>Total violations</div>
                    </div>
                    <div class="card">
                        <div class="metric">${Math.round((lighthouse?.accessibility || 0) * 100)}</div>
                        <div>Lighthouse accessibility</div>
                    </div>
                </div>

                <h2>Top Accessibility Issues</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Issue</th>
                            <th>WCAG</th>
                            <th>Level</th>
                            <th>Severity</th>
                            <th>Occurrences</th>
                            <th>Affected Pages</th>
                            <th>Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topIssuesHtml}
                    </tbody>
                </table>

                <h2>Template-Level Findings</h2>
                ${templatesHtml}
            </body>
            </html>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.listen(3000, () => console.log("API running on 3000"));