const puppeteer = require("puppeteer");
const axeCore = require("axe-core");

async function inspectIssue(url, issueId) {
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    try {
        const page = await browser.newPage();

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

        const issue = axeResults.violations.find(
            v => v.id === issueId
        );

        if (!issue) {
            return null;
        }

        return {
            url,
            issue: issue.id,
            impact: issue.impact,
            description: issue.description,
            help: issue.help,
            helpUrl: issue.helpUrl,
            nodes: issue.nodes.slice(0, 10).map(node => ({
                target: node.target,
                html: node.html,
                failureSummary: node.failureSummary
            }))
        };

    } finally {
        await browser.close();
    }
}

module.exports = inspectIssue;