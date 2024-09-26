// Run at `headless_browser/` as: node server.js
// @ts-check

/**
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').Page} Page
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { argv, chdir, cwd } from "node:process"
import { chromium } from "playwright"

/** Absolute path of initial current working directory. */
const CWD = cwd()
/** Absolute path of magic directory to read input from. */
const INPUT_DIR = `${CWD}/input_urls.csv`
/** Absolute path of global magic directory to write output to. */
const OUTPUT_DIR = `${CWD}/target`
/** Options for the CLI. */
const opts = {
    uiDebug: false,
    urlLimit: 1_000_000_000,
}

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
    for (const url of urls.slice(0, opts.urlLimit)) {
        await testSite(url, nTimes)
    }
}

function readCliOptions() {
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index]
        if (arg === "--ui-debug") {
            opts.uiDebug = true
        } else if (arg === "--url-limit") {
            opts.urlLimit = parseInt(argv[++index])
            console.assert(opts.urlLimit > 0, "URL limit must be positive.")
        }
    }
}

/**
 * Read a file to get the URLs per line.
 * @param {string} path - The path to the file containing the URLs.
 */
async function readInputUrls(path) {
    const urls = await readFile(path)
    return urls
        .toString()
        .trim()
        .split("\n")
        .map((line) => "https://" + line.split(",")[1].trim() + "/")
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
    const maxFail = nTimes * 2
    await mkFreshDir(userDataDir)
    const writePromises = []
    for (let count = 0, nFail = 0; count < nTimes && nFail < maxFail; count++) {
        console.log("Test %d of %s.", count, url)
        const logDir = `${urlOutputDir}/${count}`
        await mkFreshDir(logDir)
        const harDir = `${urlOutputDir}/${count}.har`
        const reachableDir = `${urlOutputDir}/reachable${count}.json`
        const task = async (/** @type {BrowserContext} */ context) =>
            await visitSite(context, url)
        try {
            const reachable = await inContext(userDataDir, logDir, harDir, task)
            const reachableJson = JSON.stringify(reachable, null, "\t")
            const writePromise = writeFile(reachableDir, reachableJson)
            writePromises.push(writePromise)
        } catch (err) {
            console.error(err)
            nFail++
            nTimes--
        }
    }
    await Promise.all(writePromises)
}

/**
 * Nuke a directory and recreate it.
 * @param {string} path
 */
async function mkFreshDir(path) {
    await rm(path, { recursive: true, force: true })
    await mkdir(path, { recursive: true })
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
    page.on("popup", async (popupPage) => {
        if (popupPage !== page) {
            // Close popups immediately.
            await popupPage.close()
        }
    })

    try {
        const secondaryPageSet = await visitUrl(page, url)
        const secondaryPages = [...secondaryPageSet]
        const secondaryVisits = secondaryPages
            .filter((link) => link.startsWith(url))
            .map((link) => ({ link, value: Math.random() }))
            .sort((a, b) => a.value - b.value)
            .map((pair) => pair.link)
            .slice(0, 3)

        const tertiaryPageSet = new Set()
        for (const secondaryUrl of secondaryVisits) {
            const navigations = await visitUrl(page, secondaryUrl)
            for (const tertiaryUrl of navigations) {
                if (!secondaryPages.includes(tertiaryUrl)) {
                    tertiaryPageSet.add(tertiaryUrl)
                }
            }
        }
        const tertiaryPages = [...tertiaryPageSet]
        const tertiaryVisits = tertiaryPages
            .filter((link) => link.startsWith(url))
            .map((link) => ({ link, value: Math.random() }))
            .sort((a, b) => a.value - b.value)
            .map((pair) => pair.link)
            .slice(0, 9)

        for (const tertiaryUrl of tertiaryVisits) {
            await visitUrl(page, tertiaryUrl)
        }

        return {
            secondaryPages,
            secondaryVisits,
            tertiaryPages,
            tertiaryVisits,
        }
    } catch (error) {
        if (opts.uiDebug) {
            console.error(error)
            await page.pause()
            return {}
        } else {
            throw error
        }
    } finally {
        page.close()
    }
}

/**
 * Visit a specified URL from the given page, interact, and record navigations.
 * @param {Page} page
 * @param {string} url
 */
async function visitUrl(page, url) {
    const /**@type {Set<string>}*/ navigations = new Set()
    let /**@type {number}*/ startMs
    let /**@type {number}*/ leftMs = INTERACTION_TIME_MS

    while (leftMs > 0) {
        let /**@type {(arg0: string) => void}*/ done
        const waitUntilDone = new Promise((resolve) => {
            done = resolve
        })

        console.log("Visiting %s.", url)
        const response = await page.goto(url, { timeout: 120_000 })
        if (response !== null && response.status() >= 400) {
            throw new Error(
                `Failed to visit ${url} with status ${response.status()}.`,
            )
        }
        const pageRoutePromise = page.route(WILDCARD_URL, async (route) => {
            const request = route.request()
            const requestUrl = request.url().split("#")[0]
            if (request.isNavigationRequest() && requestUrl !== url) {
                // Block navigation and go back.
                // This is somewhat unreliable—sometimes the browser goes back to
                // `about:blank` or stops running Gremlins.
                // We check this lower below ("noHorde").
                const endMs = Date.now()
                const elapsed = endMs - startMs
                console.log(
                    "Blocked navigation: %s. Interacted for %d ms.",
                    requestUrl,
                    elapsed,
                )
                navigations.add(requestUrl)
                // Delaying the response helps the browser settle down a lot.
                setTimeout(async () => {
                    await route.fulfill({
                        body: "<script>window.history.back()</script>",
                        contentType: "text/html",
                    })
                    startMs = Date.now()
                }, 1000)
            } else {
                await route.continue()
            }
        })
        page.on("load", async (frame) => {
            const endMs = Date.now()
            const elapsed = endMs - startMs
            console.log("Frame %s.", frame.url())
            try {
                const hasHorde = await page.evaluate(
                    () => window.__hordePromise__ !== undefined,
                )
                if (!hasHorde) {
                    startMs -= elapsed
                    done("noHorde")
                }
            } catch (_) {
                // Not settled down on a page.
            }
        })

        try {
            // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
            // Here, we do not run the Gremlins script before the page's own to
            // avoid affecting its performance.
            await page.evaluate(await gremlinsScript())
            await pageRoutePromise
            startMs = await page.evaluate((seed) => {
                // Create Gremlins horde within the browser context and unleash it.
                // See <https://marmelab.com/gremlins.js/>.
                window.__hordePromise__ = gremlins
                    .createHorde({
                        randomizer: new gremlins.Chance(seed),
                        species: gremlins.allSpecies,
                        mogwais: [gremlins.mogwais.alert()],
                        strategies: [
                            gremlins.strategies.distribution({ delay: 10 }),
                            // This is way too much, so it would time out anyway.
                            gremlins.strategies.allTogether({ nb: 100_000 }),
                        ],
                    })
                    .unleash()
                    .then(() => {
                        console.log("done")
                        // @ts-ignore Tell the router we are done.
                        window.location = "https://done/"
                    })
                return Date.now()
            }, url)

            while (leftMs > 0) {
                setTimeout(() => done("timeout"), leftMs)
                const status = await waitUntilDone
                if (status === "timeout") {
                    const endMs = Date.now()
                    const elapsed = endMs - startMs
                    console.log(
                        "Gremlins interaction timed out after %s ms since last update.",
                        elapsed,
                    )
                    leftMs -= elapsed
                } else if (status === "noHorde") {
                    // Go to the outer loop to reload the page.
                    break
                } else {
                    throw new Error("Unexpected status: " + status)
                }
            }
        } finally {
            await page.unroute(WILDCARD_URL)
        }
    }
    return navigations
}

/** Wildcard URL pattern to match all URLs. */
const WILDCARD_URL = "**/*"

/** Placeholder variable for the gremlins in the browser.
 * @global @type {Object} */
var gremlins
/** Placeholder variable for the window object in the browser.
 * @global @type {Object} */
var window

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
        bypassCSP: true,
        devtools: opts.uiDebug,
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
