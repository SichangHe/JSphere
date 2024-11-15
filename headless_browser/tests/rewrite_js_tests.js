import { rewriteJs } from "../rewrite_js.js"
import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { exit } from "node:process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function testAndWrite(inputDir, outputDir) {
    const input = await readFile(`${__dirname}/${inputDir}`, "utf8")
    const expected = await readFile(`${__dirname}/${outputDir}`, "utf8")
    const actual = rewriteJs(input)
    if (expected !== actual) {
        await writeFile(`${__dirname}/${outputDir}`, actual)
        console.error(
            `${inputDir} rewrite output unexpected. See ${outputDir}.`,
        )
        return 1
    }
    return 0
}

const exitCode = (
    await Promise.all([
        testAndWrite(
            "scripts_to_rewrite/dummy.js",
            "scripts_to_rewrite/rewritten_dummy.js",
        ),
        testAndWrite(
            "scripts_to_rewrite/network.js",
            "scripts_to_rewrite/rewritten_network.js",
        ),
        testAndWrite(
            "scripts_to_rewrite/google_crashed_us.js",
            "scripts_to_rewrite/rewritten_google_crashed_us.js",
        ),
        testAndWrite(
            "scripts_to_rewrite/desktop_polymer.js",
            "scripts_to_rewrite/rewritten_desktop_polymer.js",
        ),
    ])
).every((r) => r === 0)
    ? 0
    : 1
exit(exitCode)
