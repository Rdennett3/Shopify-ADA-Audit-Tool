function buildSummary(pageResults) {
    const issueMap = {};
    const templateMap = {};

    for (const page of pageResults) {
        const template = page.type || "unknown";

        if (!templateMap[template]) {
            templateMap[template] = {
                template,
                pagesScanned: 0,
                pagesWithIssues: 0,
                totalViolations: 0,
                examplePages: [],
                issues: {}
            };
        }

        templateMap[template].pagesScanned += 1;

        if (templateMap[template].examplePages.length < 5) {
            templateMap[template].examplePages.push(page.url);
        }

        if (page.violations > 0) {
            templateMap[template].pagesWithIssues += 1;
        }

        templateMap[template].totalViolations += page.violations;

        for (const issue of page.issues || []) {
            if (!issueMap[issue.id]) {
                issueMap[issue.id] = {
                    id: issue.id,
                    title: issue.title,
                    wcag: issue.wcag,
                    level: issue.level,
                    severity: issue.severity,
                    recommendation: issue.recommendation,
                    count: 0,
                    affectedPages: 0
                };
            }

            issueMap[issue.id].count += issue.count;
            issueMap[issue.id].affectedPages += 1;

            if (!templateMap[template].issues[issue.id]) {
                templateMap[template].issues[issue.id] = {
                    id: issue.id,
                    title: issue.title,
                    wcag: issue.wcag,
                    level: issue.level,
                    severity: issue.severity,
                    recommendation: issue.recommendation,
                    count: 0,
                    affectedPages: 0
                };
            }

            templateMap[template].issues[issue.id].count += issue.count;
            templateMap[template].issues[issue.id].affectedPages += 1;
        }
    }

    const templates = Object.values(templateMap).map(template => ({
        ...template,
        issues: Object.values(template.issues)
            .sort((a, b) => b.count - a.count)
    }));

    return {
        pagesScanned: pageResults.length,
        pagesWithIssues: pageResults.filter(
            p => p.violations > 0
        ).length,
        totalViolations: pageResults.reduce(
            (sum, p) => sum + p.violations,
            0
        ),
        topIssues: Object.values(issueMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        templates
    };
}

module.exports = buildSummary;