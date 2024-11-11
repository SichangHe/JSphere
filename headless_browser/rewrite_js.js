/**
 * @typedef {import("acorn").ClassBody} ClassBody
 * @typedef {import("acorn").Expression} Expression
 * @typedef {import("acorn").ModuleDeclaration} ModuleDeclaration
 * @typedef {import("acorn").Program} Program
 * @typedef {import("acorn").Statement} Statement
 * @typedef {import("playwright").Page} Page
 * @typedef {import("playwright").Route} Route
 */
import { parse } from "acorn"
import { pCall, pCallAsync } from "./helpers.js"

const parseOptions = {
    ecmaVersion: "latest",
    // NOTE: It seems module setting can also parse scripts.
    sourceType: "module",
}

/**
 * @param {Page} page - The page to intercept JS requests on.
 */
export function rewriteJsResponses(page) {
    // NOTE: Some URLs not ending with `cjs`, `mts`, `jsx`, etc. also point to
    // JS files, but let's not go crazy and just catch common cases.
    page.route(/\.([cm]?[jt]sx?|svelte)$/, overwriteResponseJs)
}

/**
 * @param {Route} route - The route to intercept.
 */
export async function overwriteResponseJs(route) {
    const response = await route.fetch()
    const fulfillOpts = { response }
    if (response.ok()) {
        const text = pCallAsync(response.text)
        if (!(text instanceof Error)) {
            const rewritten = rewriteJs(text)
            if (!(rewritten instanceof Error)) {
                fulfillOpts.body = rewritten.toString()
            }
        }
    }
    await route.fulfill(fulfillOpts)
}

/**
 * @param {string} source - Source of JS script.
 */
export function rewriteJs(source) {
    const program = pCall(() => parse(source, parseOptions))
    if (program instanceof Error) {
        return program
    }
    const rewritten = rewriteStatements(program.body, source)
    return rewritten
}

/** Target maximum size per `eval` block is 1kB. */
const MAX_EVAL_SIZE = 1000

/**
 * @param {(Statement | ModuleDeclaration)[]} statements - Statements in a program or function.
 * @param {string} source - Source code.
 */
function rewriteStatements(statements, source) {
    const rewritten = new RewrittenStatements()
    let totalLen = 0

    for (const statement of statements) {
        const t = statement.type
        let span = source.slice(statement.start, statement.end)
        // TODO: Use byte size instead of character count.
        let effectiveLen = span.length
        if (effectiveLen > MAX_EVAL_SIZE) {
            let /**@type{Statement[]}*/ bodyArr = []
            const /**@type {Statement | Statement[] | ClassBody | undefined}*/ body =
                    statement.body
            const /**@type {boolean | Expression | undefined}*/ expr =
                    statement.expression
            const /**@type {Expression | undefined}*/ callee = statement.callee
            const /**@type {Expression | undefined}*/ object = statement.object
            if (body == undefined) {
                if (expr != undefined && !(expr instanceof Boolean)) {
                    bodyArr = [expr]
                } else if (callee != undefined) {
                    bodyArr = [callee]
                } else if (object != undefined) {
                    bodyArr = [object]
                }
            } else if (body instanceof Array) {
                bodyArr = body
            } else if (body.type === "ClassBody") {
                // TODO: Perhaps break down large classes.
            } else {
                bodyArr = [body]
            }

            if (bodyArr.length > 0) {
                const spanRewritten = rewriteStatements(bodyArr, source)
                const bodyStart = bodyArr[0].start
                const bodyEnd = bodyArr[bodyArr.length - 1].end
                const header = source.slice(statement.start, bodyStart)
                const footer = source.slice(bodyEnd, statement.end)
                span = `${header}${spanRewritten.text}${footer}`
                effectiveLen =
                    header.length + spanRewritten.effectiveLen + footer.length
            }
        }

        const rewrittenStatement = new RewrittenStatement(span, effectiveLen)
        totalLen += effectiveLen
        if (t === "ClassDeclaration" || t === "FunctionDeclaration") {
            rewritten.hoisting.push(rewrittenStatement)
        } else if (t === "ImportDeclaration") {
            rewritten.imports.push(span)
        } else if (
            t === "ExportDefaultDeclaration" ||
            t === "ExportNamedDeclaration" ||
            t === "ExportAllDeclaration"
        ) {
            throw new ExportUnsupportedErr()
        } else {
            rewritten.regular.push(rewrittenStatement)
        }
    }

    const importText = rewritten.imports.map((s) => s + "\n").join("")
    if (totalLen > MAX_EVAL_SIZE) {
        // Need to try split the script into `eval` blocks.
        let /**@type{RewrittenStatement[]}*/ currentEvalBlock = []
        const /**@type{RewrittenStatement[][]}*/ evalBlocks = []
        let currentLen = 0

        for (const statement of rewritten.allStatements()) {
            if (
                currentLen > 0 &&
                currentLen + statement.effectiveLen > MAX_EVAL_SIZE
            ) {
                // Need to group existing block and start a new one.
                evalBlocks.push(currentEvalBlock)
                currentEvalBlock = []
                currentLen = 0
            }
            currentEvalBlock.push(statement)
            currentLen += statement.effectiveLen
        }
        if (currentEvalBlock.length > 0) {
            evalBlocks.push(currentEvalBlock)
        }

        const nestedBlocks = evalBlocks.reduceRight((prevBlock, block) => {
            const evalBlock = makeEvalBlock(prevBlock)
            block.push(new RewrittenStatement(evalBlock, 0))
            return block
        })
        const text = nestedBlocks.map((block) => block.text).join("\n")
        const effectiveLen = nestedBlocks
            .map((block) => block.effectiveLen)
            .reduce((a, b) => a + b)
        return new RewrittenStatement(importText + text, effectiveLen)
    } else {
        const text = rewritten
            .allStatements()
            .map((statement) => statement.text)
            .join("\n")
        return new RewrittenStatement(importText + text, totalLen)
    }
}

/**
 * We cannot rewrite scripts that use `export` statements because they do not work in `eval`, hence this error.
 */
export class ExportUnsupportedErr extends Error {}

/** Group rewritten statements into an `eval` block and clear the given array.
 * @param {RewrittenStatement[]} rStatementArr - Array of `rewrittenStatement`s to group into an `eval` block.
 */
function makeEvalBlock(rStatementArr) {
    const content = rStatementArr
        .map((statement) => escapeBackticksSlashes(statement.text))
        .join("\n")
    while (true) {
        // There is no `Array.clear`??
        if (rStatementArr.pop() == undefined) {
            break
        }
    }
    return `var __jsphereEvalRes = eval(\`(function(){
${content}}).call(this)\`);
if (__jsphereEvalRes !== undefined) {
    return __jsphereEvalRes;
}
`
}

/**
 * @param {string} s
 */
function escapeBackticksSlashes(s) {
    return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`")
}

/**
 * @field {string[]} imports - `import` statements that must be outside any `eval`.
 * @field {RewrittenStatement[]} hoisting - Statements that are evaluated first.
 * @field {RewrittenStatement[]} regular - Regular statements.
 */
export class RewrittenStatements {
    constructor() {
        const /** @type {string[]} */ imports = []
        this.imports = imports
        const /** @type {RewrittenStatement[]} */ hoisting = []
        this.hoisting = hoisting
        const /** @type {RewrittenStatement[]} */ regular = []
        this.regular = regular
    }

    /**
     * All hoisting and regular statements, but not `import` statements.
     */
    allStatements() {
        // How to chain iterators??
        return this.hoisting.concat(this.regular)
    }
}

/**
 * @field {string} text - Source or modified source of the statement.
 * @field {number} effectiveLen - The length when ignoring nested `eval` inside.
 */
export class RewrittenStatement {
    /**
     * @param {string} text - Source or modified source of the statement.
     * @param {number} effectiveLen - The length when ignoring nested `eval` inside.
     */
    constructor(text, effectiveLen) {
        this.text = text
        this.effectiveLen = effectiveLen
    }

    toString() {
        return `//${this.effectiveLen} jsphere effectiveLen
${this.text}`
    }
}
