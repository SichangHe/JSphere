// Run at `headless_browser/` as: node server.js
// @ts-check

/**
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').Page} Page
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { argv, chdir, cwd } from "node:process"
import { chromium } from "playwright"

/** Absolute path of initial current working directory. */
const CWD = cwd()
/** Absolute path of magic directory to read input from. */
const INPUT_DIR = `${CWD}/input_urls.txt`
/** Absolute path of global magic directory to write output to. */
const OUTPUT_DIR = `${CWD}/target`
/** Options for the CLI. */
const opts = {}

/**
 * Buffer for the gremlins script.
 * It can be either a promise when the script is being read from the file system or a string of the script.
 * @type {undefined |Promise<Buffer> | string}
 */
let _gremlinsBuf = undefined
/**
 * @returns {Promise<string>} The gremlins script, either cached or newly read.
 */
async function gremlinsScript() {
    if (_gremlinsBuf === undefined) {
        _gremlinsBuf = readFile(
            "./node_modules/gremlins.js/dist/gremlins.min.js",
        )
    }
    if (_gremlinsBuf instanceof Promise) {
        _gremlinsBuf = (await _gremlinsBuf).toString()
    }
    return _gremlinsBuf
}

async function main() {
    readCliOptions()
    const urls = await readInputUrls(INPUT_DIR)
    gremlinsScript() // Start reading the gremlins script in the background.
    const nTimes = 5
    for (const url of urls) {
        await testSite(url, nTimes)
    }
}

function readCliOptions() {
    for (const arg of argv) {
        if (arg === "--ui-debug") {
            opts.uiDebug = true
        }
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
    const writePromises = []
    for (let count = 0; count < nTimes; count++) {
        console.log("Test %d of %s.", count, url)
        const logDir = `${urlOutputDir}/${count}`
        await mkdir(logDir, { recursive: true })
        const harDir = `${urlOutputDir}/${count}.har`
        const reachableDir = `${urlOutputDir}/reachable${count}.json`
        const task = async (/** @type {BrowserContext} */ context) =>
            await visitSite(context, url)
        const reachable = await inContext(userDataDir, logDir, harDir, task)
        const writePromise = writeFile(reachableDir, JSON.stringify(reachable))
        writePromises.push(writePromise)
    }
    await Promise.all(writePromises)
}

/** Time to interact in milliseconds. */
const INTERACTION_TIME_MS = 30_000

/**
 * Visits a specified site in the given browser context.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url - The URL to visit.
 */
async function visitSite(context, url) {
    const page = await context.newPage()
    const reachable = {}
    try {
        reachable.secondaryPages = await visitUrl(page, url)
        // TODO: Go to secondary and tertiary pages in `navigations`.
    } catch (error) {
        console.error(error)
        // Sleep for 10,000 seconds to keep the browser open for debugging.
        await new Promise((resolve) => setTimeout(resolve, 10_000_000))
    } finally {
        page.close()
    }
    return reachable
}

/**
 * Visit a specified URL from the given page, interact, and record navigations.
 * @param {Page} page
 * @param {string} url
 */
async function visitUrl(page, url) {
    const /**@type {Set<string>}*/ navigations = new Set()
    let leftMs = INTERACTION_TIME_MS
    let /**@type {number}*/ startMs
    let /**@type {number|undefined}*/ endMs
    let /**@type {Promise|undefined}*/ blockPromise

    console.log("Visiting %s.", url)
    // TODO: Add timeout.
    // TODO: Handle returned response, e.g., 404.
    await page.goto(url)
    const pageRoutePromise = page.route(WILDCARD_URL, async (route) => {
        const request = route.request()
        const requestUrl = request.url().split("#")[0]
        if (request.isNavigationRequest() && requestUrl !== url) {
            // Block navigation, record it, subtract the interaction time, and
            // go back in the browser.
            if (endMs === undefined) {
                endMs = Date.now()
                console.assert(startMs !== undefined)
                const elapsed = endMs - startMs
                leftMs -= elapsed
            }
            // Block navigation and go back.
            blockPromise = route.fulfill({
                body: "<script>window.history.back()</script>",
                contentType: "text/html",
            })
            console.log(
                "Blocked navigation: %s. %d ms left",
                requestUrl,
                leftMs,
            )
            navigations.add(requestUrl)
        } else {
            await route.continue()
        }
    })

    try {
        // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
        // Here, we do not run the Gremlins script before the page's own to
        // avoid affecting its performance.
        await page.evaluate(await gremlinsScript())
        await pageRoutePromise
        // FIXME: This whole retry business is unnecessary because
        // the browser resumes the script after going back.
        while (leftMs > 0) {
            try {
                startMs = await page.evaluate(
                    ({
                        /**@type{number}*/ leftMs,
                        /**@type{number|string}*/ url,
                    }) => {
                        // Create Gremlins horde within the browser context and unleash it.
                        // See <https://marmelab.com/gremlins.js/>.
                        const ACTION_DELAY_MS = 10
                        const nb = Math.ceil(leftMs / ACTION_DELAY_MS)
                        __hordePromise__ = gremlins
                            .createHorde({
                                randomizer: new gremlins.Chance(url),
                                species: gremlins.allSpecies,
                                mogwais: [gremlins.mogwais.alert()],
                                strategies: [
                                    gremlins.strategies.distribution({
                                        delay: ACTION_DELAY_MS,
                                    }),
                                    gremlins.strategies.allTogether({ nb }),
                                ],
                            })
                            .unleash()
                        return Date.now()
                    },
                    { leftMs, url },
                )
            } catch (error) {
                if (
                    error.message ===
                    "page.evaluate: Execution context was destroyed, most likely because of a navigation"
                ) {
                    console.log("Not in context. Simply waiting for timeout")
                    await new Promise((resolve) => setTimeout(resolve, leftMs))
                    break
                } else {
                    throw error
                }
            }

            try {
                await page.evaluate(() => __hordePromise__)
                break
            } catch (error) {
                if (
                    error.message ===
                    "page.evaluate: Execution context was destroyed, most likely because of a navigation."
                ) {
                    console.log("Blocked navigation.")
                    console.assert(blockPromise !== undefined)
                    await blockPromise
                    // Wait for the page to load.
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    console.log("Navigating back.")
                    // await page.goBack({ waitUntil: "load" })
                    // await new Promise((resolve) => setTimeout(resolve, 100))
                    // console.log("Navigated back.")
                    continue
                } else {
                    console.log("Error message: %s", error.message)
                    throw error
                }
            }
        }
    } finally {
        await page.unroute(WILDCARD_URL)
    }
    return navigations
}

/** Wildcard URL pattern to match all URLs. */
const WILDCARD_URL = "**/*"

/** Placeholder variable for the gremlins in the browser.
 * @global @type {Object} */
var gremlins
/** Placeholder variable for the "unleash" horde promise in the browser.
 * @global @type {Object} */
let __hordePromise__

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
        executablePath: opts.uiDebug
            ? undefined
            : "/opt/chromium.org/chromium/chrome",
        chromiumSandbox: false,
        slowMo: opts.uiDebug ? 300 : undefined,
        // Prevent Playwright from using `--headless=old`.
        headless: false,
        args: ["--disable-site-isolation-trials"].concat(
            opts.uiDebug ? [] : ["--headless"],
        ),
        ignoreDefaultArgs: [
            "--disable-background-networking",
            "--disable-back-forward-cache",
            "--disable-popup-blocking",
        ],
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
