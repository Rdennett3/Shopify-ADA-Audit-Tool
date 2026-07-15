const mapWcagIssue = require("./wcagMapper");
const axeCore = require("axe-core");

function selectScanTargets(pages, maxPages = 20) {
    const groupedPages = pages.reduce((groups, page) => {
        const type = page.type || "unknown";

        if (!groups[type]) {
            groups[type] = [];
        }

        groups[type].push(page);

        return groups;
    }, {});

    const selected = [];
    const pageTypes = Object.keys(groupedPages);

    // First, select one page from every available template type.
    for (const type of pageTypes) {
        const page = groupedPages[type].shift();

        if (page) {
            selected.push(page);
        }
    }

    // Then fill the remaining slots in round-robin order.
    while (
        selected.length < maxPages &&
        pageTypes.some(type => groupedPages[type].length > 0)
    ) {
        for (const type of pageTypes) {
            if (selected.length >= maxPages) {
                break;
            }

            const page = groupedPages[type].shift();

            if (page) {
                selected.push(page);
            }
        }
    }

    return selected;
}

async function scanPages(page, pages, scanMode = "sample") {
    const eligiblePages = pages.filter(
        page => page.priority !== "low"
    );

    const scanTargets =
        scanMode === "full"
            ? eligiblePages
            : selectScanTargets(eligiblePages, 20);

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