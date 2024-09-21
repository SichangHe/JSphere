// Run at `headless_browser/` as: node server.js
// @ts-check

/**
 * @typedef {import('playwright').BrowserContext} BrowserContext
 */
import { mkdir, readFile } from "node:fs/promises"
import { chdir } from "node:process"
import { chromium } from "playwright"

/** Magic directory read input from. */
const INPUT_DIR = "input_urls.txt"
/** Global magic directory to write output to. */
const OUTPUT_DIR = "target"

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
            readFile("./node_modules/gremlins.js/dist/gremlins.min.js"),
            readFile("./runGremlins.js"),
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
    const urls = await readInputUrls(INPUT_DIR)
    gremlinsScript() // Start reading the gremlins script in the background.
    const nTimes = 5
    for (const url of urls) {
        await testSite(url, nTimes)
    }
}

/**
 * Read a file to get the URLs per line.
 * @param {string} path - The path to the file containing the URLs.
 */
async function readInputUrls(path) {
    const urls = await readFile(path)
    return urls.toString().split("\n")
}

/**
 * Test a specified website for the given number of times.
 * - Reuse browser context per URL.
 * - Writes each URL's data to a directory under `OUTPUT_DIR`, with
 *     the logs in `1/`, `2/`, etc. and the HARs at `1.har`, `2.har`, etc.
 * @param {string} url - The URL to visit.
 * @param {number} nTimes - The number of times to visit the URL.
 */
async function testSite(url, nTimes) {
    const urlEncoded = encodeURIComponent(url)
    const urlOutputDir = `${OUTPUT_DIR}/${urlEncoded}`
    const userDataDir = `${urlOutputDir}/user_data`
    await mkdir(userDataDir, { recursive: true })
    for (let count = 0; count < nTimes; count++) {
        const logDir = `${urlOutputDir}/${count}`
        await mkdir(logDir, { recursive: true })
        const harDir = `${urlOutputDir}/${count}.har`
        const task = async (/** @type {BrowserContext} */ context) =>
            await visitSite(context, url)
        await inContext(userDataDir, logDir, harDir, task)
    }
}

/**
 * Visits a specified site in the given browser context.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url - The URL to visit.
 */
async function visitSite(context, url) {
    const page = await context.newPage()
    try {
        // TODO: Add timeout.
        await page.goto(url)
        // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
        // Here, we do not run the Gremlins script before the page's own to
        // avoid affecting its performance.
        const gremlinsScriptContent = await gremlinsScript()
        await page.evaluate(gremlinsScriptContent)
        // TODO: Trap links.
        // TODO: Go to secondary and tertiary pages.
    } finally {
        page.close()
    }
}

/**
 * Executes a task in a new browser context and ensures the context and
 * browser are closed afterwards.
 * @template T
 * @param {string} userDataDir - Directory to restore and store user data for browser context.
 * @param {string} logDir - Directory to run the browser and write VV8 logs.
 * @param {string} harDir - Directory to write the HAR file.
 * @param {function(BrowserContext): Promise<T>} task - The task to be executed in the new context. This function should accept a single parameter: the context.
 */
async function inContext(userDataDir, logDir, harDir, task) {
    chdir(logDir)
    const context = await chromium.launchPersistentContext(userDataDir, {
        acceptDownloads: false,
        executablePath: "/opt/chromium.org/chromium/chrome",
        chromiumSandbox: false,
        // Prevent Playwright from using `--headless=old`.
        headless: false,
        args: ["--headless"],
        recordHar: {
            content: "omit",
            path: harDir,
            mode: "full",
        },
        userAgent:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WebMeasure/1.0 (https://webresearch.eecs.umich.edu/overview-of-web-measurements/)",
        viewport: {
            width: 1920,
            height: 1080,
        },
    })
    try {
        return await task(context)
    } finally {
        await context.close()
    }
}

await main()
