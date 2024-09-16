// Run as: node server.js

import { chromium, Browser, BrowserContext } from "playwright"

async function main() {
    console.log(chromium)
    const browser = await chromium.launch({
        executablePath: "/opt/chromium.org/chromium/chrome",
        chromiumSandbox: false,
        headless: true,
    })
    const url = "https://www.youtube.com"
    const nTimes = 5
    await inContext(browser, async (context) =>
        visitPageNTimes(context, url, nTimes),
    )
}

/**
 * Visits a specified URL in the given browser context for the given number of times.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url - The URL to visit.
 * @param {number} nTimes - The number of times to visit the URL.
 * @returns {Promise<void>} A promise that resolves when the page has been visited.
 */
async function visitPageNTimes(context, url, nTimes) {
    for (let count = 0; count < nTimes; count++) {
        await visitPage(context, url)
    }
}

/**
 * Visits a specified URL in the given browser context.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url - The URL to visit.
 * @returns {Promise<void>} A promise that resolves when the page has been visited.
 */
async function visitPage(context, url) {
    const page = await context.newPage()
    try {
        await page.routeFromHAR("TODO.har", { update: true })
        // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
        // NOTE: this could affect the page's performance.
        await page.addInitScript({
            path: "./node_modules/gremlins.js/dist/gremlins.min.js",
        })
        await page.goto(url)
        await page.evaluate(() =>
            // See <https://marmelab.com/gremlins.js/>.
            // This runs within the browser context.
            gremlins
                .createHorde({
                    randomizer: new gremlins.Chance(1234),
                    species: gremlins.allSpecies,
                    mogwais: [gremlins.mogwais.alert()],
                    strategies: [
                        // 1 ms delay between each action.
                        gremlins.strategies.distribution({ delay: 1 }),
                        // 30,000 actions ⇒ 30 seconds.
                        gremlins.strategies.allTogether({ nb: 30_000 }),
                    ],
                })
                .unleash(),
        )
        throw new Error("TODO")
    } finally {
        page.close()
    }
}

/**
 * Executes a task in a new browser context and ensures the context is closed afterwards.
 * @param {Browser} browser - The browser instance in which to create a new context.
 * @param {function(BrowserContext): Promise<*>} task - The task to be executed in the new context. This function should accept a single parameter: the context.
 * @returns {Promise<*>} A promise that resolves with the result of the task when the task has been executed and the context has been closed.
 */
async function inContext(browser, task) {
    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Web Measure/1.0 (https://webresearch.eecs.umich.edu/overview-of-web-measurements/)",
    })
    try {
        return await task(context)
    } finally {
        await context.close()
    }
}

await main()
