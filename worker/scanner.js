const mapWcagIssue = require("./wcagMapper");
const axeCore = require("axe-core");

async function scanPages(page, pages) {
    const scanTargets = pages
        .filter(p => p.priority !== "low")
        .slice(0, 20);

    const pageResults = [];

    for (const pageObj of scanTargets) {
        const url = pageObj.url;

        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 30000
            });

            await page.addScriptTag({
                content: axeCore.source
            });

            const axeResults = await page.evaluate(async () => {
                return await axe.run();
            });

            pageResults.push({
                url,
                type: pageObj.type,
                violations: axeResults.violations.length,
                issues: axeResults.violations.map(v =>
                    mapWcagIssue({
                        id: v.id,
                        impact: v.impact,
                        description: v.description,
                        help: v.help,
                        count: v.nodes.length
                    })
                )
            });

        } catch (err) {
            console.error(
                "Scan failed:",
                url,
                err.message
            );
        }
    }

    return pageResults;
}

module.exports = scanPages;