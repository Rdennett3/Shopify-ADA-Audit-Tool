function classifyPage(url) {
    const u = new URL(url);

    const path = u.pathname;

    // Shopify system pages (ignore or low priority)
    if (
        path.startsWith("/cart") ||
        path.startsWith("/checkout") ||
        path.startsWith("/account") ||
        path.startsWith("/search")
    ) {
        return {
            url,
            type: "system",
            template: "system",
            priority: "low"
        };
    }

    // Products
    if (path.startsWith("/products/")) {
        return {
            url,
            type: "product",
            template: "product",
            priority: "high"
        };
    }

    // Collections
    if (path.startsWith("/collections/")) {
        return {
            url,
            type: "collection",
            template: "collection",
            priority: "high"
        };
    }

    // Blog posts
    if (path.startsWith("/blogs/")) {
        return {
            url,
            type: "blog",
            template: "article",
            priority: "medium"
        };
    }

    // Pages
    if (path.startsWith("/pages/")) {
        return {
            url,
            type: "page",
            template: "page",
            priority: "medium"
        };
    }

    // homepage
    if (path === "/" || path === "") {
        return {
            url,
            type: "home",
            template: "index",
            priority: "high"
        };
    }

    // fallback
    return {
        url,
        type: "unknown",
        template: "unknown",
        priority: "low"
    };
}

module.exports = classifyPage;