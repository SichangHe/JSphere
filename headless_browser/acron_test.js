import { parse } from "acorn"

const tree = parse(
    `
import { parse } from "acorn"

const tree = parse("1 + 1", { ecmaVersion: 2025 })
log(tree)
for (const statement of tree.body) {
    log(statement)
}
function log(input) {
    console.log(input)
}
var a;
`,
    { ecmaVersion: 2025, sourceType: "module" },
)
console.log(tree, "\n")
for (const statement of tree.body) {
    console.log(statement, "\n")
}
