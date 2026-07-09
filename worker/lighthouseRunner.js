const lighthouse = require("lighthouse").default || require("lighthouse");
const chromeLauncher = require("chrome-launcher");

async function runLighthouse(url) {
    const chrome = await chromeLauncher.launch({
        chromeFlags: [
            "--headless",
            "--no-sandbox",
            "--disable-dev-shm-usage"
        ]
    });

    try {
        const runnerResult = await lighthouse(url, {
            port: chrome.port,
            output: "json"
        });

        return runnerResult.lhr;
    } finally {
        await chrome.kill();
    }
}

module.exports = runLighthouse;