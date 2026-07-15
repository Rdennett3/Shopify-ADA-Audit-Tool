const { MongoClient } = require("mongodb");
const puppeteer = require("puppeteer");
const runLighthouse = require("./lighthouseRunner");
const scanPages = require("./scanner");
const buildSummary = require("./reportBuilder");
const discoverPages = require("./crawler");

const client = new MongoClient(process.env.MONGO_URL);

async function run() {
    await client.connect();
    const db = client.db("ada");

    console.log("Worker running...");

    setInterval(async () => {
        try {
            const job = await db.collection("jobs").findOne({ status: "queued" });

            if (!job) return;

            console.log("Scanning:", job.url);

            await db.collection("jobs").updateOne(
                { _id: job._id },
                { $set: { status: "running" } }
            );

            const {
                sitemapIndex,
                pages
            } = await discoverPages(job.url);

            console.log(
                pages.reduce((acc, p) => {
                    acc[p.type] = (acc[p.type] || 0) + 1;
                    return acc;
                }, {})
            );

            console.log("Total pages discovered:", pages.length);

            const browser = await puppeteer.launch({
                executablePath: "/usr/bin/chromium",
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
            });

            const page = await browser.newPage();

            const pageResults = await scanPages(
                page,
                pages,
                job.scanMode || "sample"
            );

            await browser.close();

            // Lighthouse run
            const lhr = await runLighthouse(job.url);

            const summary = buildSummary(pageResults);

            console.log(summary);

            console.log(
                "Result size:",
                JSON.stringify(pageResults).length / 1024,
                "KB"
            );

            await db.collection("jobs").updateOne(
                { _id: job._id },
                {
                    $set: {
                        status: "complete",
                        results: {
                            coverage: {
                                scanMode: job.scanMode || "sample",
                                pagesDiscovered: pages.length,
                                pagesScanned: pageResults.length,
                                sitemapCount: sitemapIndex.length
                            },
                            summary,
                            pages: pageResults,
                            lighthouse: {
                                accessibility: lhr.categories.accessibility.score,
                                performance: lhr.categories.performance.score,
                                seo: lhr.categories.seo.score,
                                bestPractices: lhr.categories["best-practices"].score
                            }
                        }
                    }
                }
            );

            console.log("Completed:", job.url);
        } catch (err) {
            console.error("Worker error:", err);
        }
    }, 5000);
}

run();