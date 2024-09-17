// Run at `headless_browser/` as: node server.js
// @ts-check

/**
 * @typedef {import('playwright').Browser} Browser
 * @typedef {import('playwright').BrowserContext} BrowserContext
 */
import { chromium } from "playwright"
import { readFile } from "fs"
import { promisify } from "util"

const readFilePromise = promisify(readFile)

/**
 * Buffer for the gremlins script.
 * It can be either a promise when the script is being read from the file system or a string of the script.
 * @type {undefined |Promise<Buffer>[] | string}
 */
let _gremlinsBuf = undefined
/**
 * @returns {Promise<string>} The gremlins script, either cached or newly read.
 */
async function gremlinsScript() {
    if (_gremlinsBuf === undefined) {
        _gremlinsBuf = [
            readFilePromise("./node_modules/gremlins.js/dist/gremlins.min.js"),
            readFilePromise("./runGremlins.js"),
        ]
    }
    if (_gremlinsBuf instanceof Array) {
        const [gremlinsPromise, runGremlinsPromise] = _gremlinsBuf
        const gremlins = await gremlinsPromise
        const runGremlins = await runGremlinsPromise
        _gremlinsBuf = `${gremlins.toString()};${runGremlins.toString()}`
    }
    return _gremlinsBuf
}

async function main() {
    gremlinsScript() // Start reading the gremlins script in the background.
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
        await visitPage(context, url, `${count}.har`)
    }
}

/**
 * Visits a specified URL in the given browser context.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url - The URL to visit.
 * @param {string} harPath - The path to write the HAR file.
 * @returns {Promise<void>} A promise that resolves when the page has been visited.
 */
async function visitPage(context, url, harPath) {
    const page = await context.newPage()
    try {
        await page.routeFromHAR(harPath, { update: true, updateMode: "full" })
        await page.goto(url)
        // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
        // Here, we do not run the Gremlins script before the page's own to
        // avoid affecting its performance.
        const gremlinsScriptContent = await gremlinsScript()
        await page.evaluate(gremlinsScriptContent)
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
