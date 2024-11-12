// Run at `headless_browser/` as: node server.js
// See `readCliOptions` for up-to-date command line options.
// @ts-check
import { argv, cwd } from "node:process"
import {
    gremlinsScript,
    opts,
    readInputSubdomains,
    testSite,
} from "./browser.js"

/** Absolute path of initial current working directory. */
const CWD = cwd()
/** Absolute path of magic directory to read input from. */
const INPUT_DIR = `${CWD}/input_urls.csv`
/** Absolute path of global magic directory to write output to. */
const OUTPUT_DIR = `${CWD}/target`

async function main() {
    readCliOptions()
    const subdomains = await readInputSubdomains(INPUT_DIR)
    gremlinsScript() // Start reading the gremlins script in the background.
    const nTimes = 5
    for (const subdomain of subdomains.slice(0, opts.rankMax)) {
        await testSite(subdomain, nTimes, OUTPUT_DIR)
    }
}

/**
 * Read options from the command line.
 * Read the code for the up-to-date options.
 */
function readCliOptions() {
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index]
        if (arg === "--ui-debug") {
            opts.uiDebug = true
        } else if (arg === "--rank-limit") {
            const [minStr, maxStr] = argv[++index].trim().split(":")
            opts.rankMin = parseInt(minStr)
            console.assert(
                opts.rankMin >= 0,
                "Minimum rank must be non-negative.",
            )
            opts.rankMax = parseInt(maxStr)
            console.assert(opts.rankMax > 0, "Maximum rank must be positive.")
            console.assert(
                opts.rankMin <= opts.rankMax,
                "Minimum must be less than or equal to maximum.",
            )
        }
    }
}

await main()
