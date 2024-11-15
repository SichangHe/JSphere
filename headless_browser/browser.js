// @ts-check
/**
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').Page} Page
 */
import { readFile, rm, writeFile } from "node:fs/promises"
import { chdir } from "node:process"
import { chromium } from "playwright"
import { afterDelay, mkFreshDir } from "./helpers.js"
import { overwriteResponseJs } from "./rewrite_js.js"

/** Options for the CLI. */
export const opts = {
    uiDebug: false,
    rankMin: 0,
    rankMax: 1_000_000_000,
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
export async function gremlinsScript() {
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

/**
 * A subdomain with its rank and name.
 */
export class Subdomain {
    /**
     * @param {number} rank
     * @param {string} name
     */
    constructor(rank, name) {
        this.rank = rank
        this.name = name
        this._nameWO3w = name.startsWith(_3W_DOT)
            ? name.slice(_3W_DOT.length)
            : name
    }

    /**
     * The root URL of the subdomain.
     */
    rootUrl() {
        return `https://${this.name}/`
    }

    /**
     * If the given URL matches the subdomain.
     * @param {string} url
     */
    matchUrl(url) {
        const urlWOHttp = url.startsWith(_HTTP_PREFIX)
            ? url.slice(_HTTP_PREFIX.length)
            : url
        const urlWOHttps = urlWOHttp.startsWith(_HTTPS_PREFIX)
            ? urlWOHttp.slice(_HTTPS_PREFIX.length)
            : url
        const urlWO3w = urlWOHttps.startsWith(_3W_DOT)
            ? urlWOHttps.slice(_3W_DOT.length)
            : urlWOHttp
        return urlWO3w.startsWith(this._nameWO3w)
    }

    toString() {
        return `${this.rank}:${this.name}`
    }
}

const _3W_DOT = "www."
const _HTTP_PREFIX = "http://"
const _HTTPS_PREFIX = "https://"

/**
 * Read a file to get the URLs per line.
 * @param {string} path - The path to the file containing the URLs.
 */
export async function readInputSubdomains(path) {
    const urls = await readFile(path)
    return urls
        .toString()
        .trim()
        .split("\n")
        .map((line) => {
            const [rankStr, subdomain] = line.trim().split(",")
            const rank = parseInt(rankStr)
            return new Subdomain(rank, subdomain)
        })
        .filter(
            (subdomain) =>
                opts.rankMin <= subdomain.rank &&
                subdomain.rank <= opts.rankMax,
        )
}

/**
 * Test a specified website for the given number of times.
 * - Reuse browser context per URL.
 * - Writes each URL's data to a directory under `outputDir`, with
 *     the logs in `1/`, `2/`, etc. and the HARs at `1.har`, `2.har`, etc.
 * @param {Subdomain} subdomain - The URL to visit.
 * @param {number} nTimes - The number of times to visit the URL.
 * @param {string} outputDir - The directory to write the output to.
 */
export async function testSite(subdomain, nTimes, outputDir) {
    const urlEncoded = encodeURIComponent(subdomain.name)
    const urlOutputDir = `${outputDir}/${urlEncoded}`
    const userDataDir = `${urlOutputDir}/user_data`
    const maxFail = nTimes * 2
    await mkFreshDir(userDataDir)
    const writePromises = []
    for (let count = 0, nFail = 0; count < nTimes && nFail < maxFail; count++) {
        console.log("Test %d of %s.", count, subdomain)
        const logDir = `${urlOutputDir}/${count}`
        await mkFreshDir(logDir)
        const harDir = `${urlOutputDir}/${count}.har`
        const reachableDir = `${urlOutputDir}/reachable${count}.json`
        const task = async (/** @type {BrowserContext} */ context) =>
            await visitSite(context, subdomain)
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
    const rmUserDataDir = rm(userDataDir, { recursive: true, force: true })
    await Promise.all(writePromises)
    await rmUserDataDir
}

/** Time to interact in milliseconds. */
const INTERACTION_TIME_MS = 30_000

/**
 * Visits a specified site in the given browser context.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {Subdomain} subdomain - The subdomain to visit.
 */
export async function visitSite(context, subdomain) {
    const secondaryPageSet = await visitUrl(context, subdomain.rootUrl())
    const secondaryPages = [...secondaryPageSet]
    const secondaryVisits = secondaryPages
        .filter((url) => subdomain.matchUrl(url))
        .map((url) => ({ url, value: Math.random() }))
        .sort((a, b) => a.value - b.value)
        .map((pair) => pair.url)
        .slice(0, N_SECONDARY_VISITS)

    const tertiaryPageSet = new Set()
    for (const secondaryUrl of secondaryVisits) {
        const navigations = await visitUrl(context, secondaryUrl)
        for (const tertiaryUrl of navigations) {
            if (!secondaryPages.includes(tertiaryUrl)) {
                tertiaryPageSet.add(tertiaryUrl)
            }
        }
    }
    const tertiaryPages = [...tertiaryPageSet]
    const tertiaryVisits = tertiaryPages
        .filter((url) => subdomain.matchUrl(url))
        .map((url) => ({ url, value: Math.random() }))
        .sort((a, b) => a.value - b.value)
        .map((pair) => pair.url)
        .slice(0, N_TERTIARY_VISITS)

    for (const tertiaryUrl of tertiaryVisits) {
        await visitUrl(context, tertiaryUrl)
    }

    return {
        secondaryPages,
        secondaryVisits,
        tertiaryPages,
        tertiaryVisits,
    }
}

const N_SECONDARY_VISITS = 3
const N_TERTIARY_VISITS = 9

/**
 * Visit a specified URL from the given page, interact, and record navigations.
 * @param {BrowserContext} context - The browser context in which to visit the URL.
 * @param {string} url
 */
export async function visitUrl(context, url) {
    const /**@type {Set<string>}*/ navigations = new Set()
    let /**@type {number}*/ leftMs = INTERACTION_TIME_MS

    while (leftMs > 0) {
        let /**@type {number}*/ startMs
        let /**@type {(arg0: string) => void}*/ done
        const waitUntilDone = new Promise((resolve) => {
            done = resolve
        })
        const page = await context.newPage()
        page.on("popup", async (popupPage) => {
            if (popupPage !== page) {
                // Close popups immediately.
                await popupPage.close()
            }
        })
        page.on("load", async (frame) => {
            const elapsed = Date.now() - startMs
            console.log("Frame %s.", frame.url())
            try {
                const hasHorde = await page.evaluate(
                    () => window.__hordePromise__ !== undefined,
                )
                if (!hasHorde) {
                    leftMs -= elapsed
                    done("noHorde")
                }
            } catch (_) {
                // Not settled down on a page.
            }
        })

        await page.route(WILDCARD_URL, async (route) => {
            try {
                const request = route.request()
                const requestUrl = request.url().split("#")[0]
                if (request.isNavigationRequest() && requestUrl !== url) {
                    // Block navigation and go back.
                    // This is somewhat unreliable—sometimes the browser goes back to
                    // `about:blank` or stops running Gremlins.
                    // We check this lower below ("noHorde").
                    const endMs = Date.now()
                    const elapsed = endMs - startMs
                    leftMs -= elapsed
                    console.log(
                        "Blocked navigation: %s. Interacted for %d ms.",
                        requestUrl,
                        elapsed,
                    )
                    navigations.add(requestUrl)
                    // Delaying the response helps the browser settle down a lot.
                    afterDelay(async () => {
                        await route.fulfill({
                            body: "<script>window.history.back()</script>",
                            contentType: "text/html",
                        })
                        startMs = Date.now()
                    }, 1000)
                } else {
                    await overwriteResponseJs(route)
                }
            } catch (error) {
                // Avoid crashing when the page is closed.
                console.error(error)
            }
        })

        console.log("Visiting %s.", url)
        const response = await page.goto(url, { timeout: 120_000 })
        if (response !== null && response.status() >= 400) {
            throw new Error(
                `Failed to visit ${url} with status ${response.status()}.`,
            )
        }

        try {
            // See <https://github.com/marmelab/gremlins.js?tab=readme-ov-file#playwright>.
            // Here, we do not run the Gremlins script before the page's own to
            // avoid affecting its performance.
            await page.evaluate(await gremlinsScript())
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
                return Date.now()
            }, url)

            let waitHandle
            while (leftMs > 0) {
                if (waitHandle !== undefined) {
                    clearTimeout(waitHandle)
                }
                waitHandle = afterDelay(() => done("timeout"), leftMs)
                const status = await waitUntilDone
                if (status === "timeout") {
                    const endMs = Date.now()
                    const elapsed = endMs - startMs
                    startMs = endMs
                    leftMs -= elapsed
                    if (elapsed > 10) {
                        // Filter out short timeouts.
                        console.log(
                            "Gremlins interaction timed out after %dms since last update. %dms to go.",
                            elapsed,
                            leftMs,
                        )
                    }
                } else if (status === "noHorde") {
                    // Go to the outer loop to reload the page.
                    break
                } else {
                    throw new Error("Unexpected status: " + status)
                }
            }
        } catch (error) {
            if (opts.uiDebug) {
                console.error(error)
                await page.pause()
                break
            } else {
                throw error
            }
        } finally {
            page.close()
        }
    }
    return navigations
}

/** Wildcard URL pattern to match all URLs. */
export const WILDCARD_URL = "**/*"

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
export async function inContext(userDataDir, logDir, harDir, task) {
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
        args: [
            "--disable-site-isolation-trials",
            // NOTE: Mitigates browser "Maximum call stack size exceeded".
            // Setting the stack size to 5 GB causes routing to be bypassed;
            // setting to 8 GB causes the browser to crash immediately.
            `--js-flags=--stack-size=4000000`,
        ].concat(opts.uiDebug ? [] : ["--headless"]),
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
