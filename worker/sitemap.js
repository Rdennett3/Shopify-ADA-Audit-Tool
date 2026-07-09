const axios = require("axios");
const xml2js = require("xml2js");

async function getSitemapIndex(baseUrl) {
    try {
        const res = await axios.get(`${baseUrl}/sitemap.xml`, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
            },
            timeout: 10000
        });

        const parsed = await xml2js.parseStringPromise(res.data);

        const sitemaps = parsed.sitemapindex.sitemap.map(
            s => s.loc[0]
        );

        return sitemaps;

    } catch (err) {
        console.error("Failed to read sitemap index:", err.message);
        return [];
    }
}

async function getUrlsFromSitemap(url) {
    try {
        const res = await axios.get(url);

        const parsed = await xml2js.parseStringPromise(res.data);

        const urls = parsed.urlset.url.map(u => u.loc[0]);

        return urls;

    } catch (err) {
        console.error("Failed to parse sitemap:", url);
        return [];
    }
}

module.exports = {
    getSitemapIndex,
    getUrlsFromSitemap
};