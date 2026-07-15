const {
    getSitemapIndex,
    getUrlsFromSitemap
} = require("./sitemap");

const classifyPage = require("./pageClassifier");

async function discoverPages(baseUrl) {
    const sitemapIndex = await getSitemapIndex(baseUrl);

    console.log("Sitemaps found:", sitemapIndex);

    let allUrls = [];

    for (const sitemap of sitemapIndex) {
        const urls = await getUrlsFromSitemap(sitemap);
        allUrls.push(...urls);
    }

    const pages = [...new Set(allUrls)]
        .map(classifyPage);

    return {
        sitemapIndex,
        pages
    };
}

module.exports = discoverPages;