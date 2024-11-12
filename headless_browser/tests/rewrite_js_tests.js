import { rewriteJs } from "../rewrite_js.js"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let input, expected, actual

input = readFileSync(`${__dirname}/scripts_to_rewrite/dummy.js`, "utf8")
expected = readFileSync(
    `${__dirname}/scripts_to_rewrite/rewritten_dummy.js`,
    "utf8",
)
actual = rewriteJs(input)?.toString()
if (expected !== actual) {
    console.error("dummy.js rewrite output unexpected")
    console.log(actual + "\n\n")
}

input = readFileSync(`${__dirname}/scripts_to_rewrite/network.js`, "utf8")
expected = readFileSync(
    `${__dirname}/scripts_to_rewrite/rewritten_network.js`,
    "utf8",
)
actual = rewriteJs(input)?.toString()
if (expected !== actual) {
    console.error("network.js rewrite output unexpected")
    console.log(actual + "\n\n")
}

input = readFileSync(
    `${__dirname}/scripts_to_rewrite/google_crashed_us.js`,
    "utf8",
)
expected = readFileSync(
    `${__dirname}/scripts_to_rewrite/rewritten_google_crashed_us.js`,
    "utf8",
)
actual = rewriteJs(input)?.toString()
if (expected !== actual) {
    console.error("google_crashed_us.js rewrite output unexpected")
    console.log(actual + "\n\n")
}
