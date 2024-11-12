import { rewriteJsResponses } from "../rewrite_js.js"
import { inContext, opts } from "../browser.js"

opts.uiDebug = true
await inContext(
    "target/headful/user_data/",
    "target/headful/",
    "target/headful/0.har",
    async (context) => {
        const page = await context.newPage()
        rewriteJsResponses(page)
        for (;;) {
            await new Promise((resolve) => setTimeout(resolve, 1_000_000))
            console.log("waiting...")
        }
    },
)
