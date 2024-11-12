// @ts-check
/**
 * @typedef {import("acorn").ClassBody} ClassBody
 * @typedef {import("acorn").Expression} Expression
 * @typedef {import("acorn").ModuleDeclaration} ModuleDeclaration
 * @typedef {import("acorn").Options} Options
 * @typedef {import("acorn").Program} Program
 * @typedef {import("acorn").Statement} Statement
 * @typedef {import("acorn").VariableDeclarator} VariableDeclarator
 * @typedef {import("playwright").Page} Page
 * @typedef {import("playwright").Route} Route
 */
import { parse } from "acorn"
import { pCall, pCallAsync } from "./helpers.js"
import { WILDCARD_URL } from "./browser.js"

const /**@type{Options}*/ parseOptions = {
        ecmaVersion: "latest",
        // NOTE: It seems module setting can also parse scripts.
        sourceType: "module",
    }

/**
 * This is only for testing because it cannot coexist with other route interceptors.
 * @param {Page} page - The page to intercept JS requests on.
 */
export function rewriteJsResponses(page) {
    page.route(WILDCARD_URL, overwriteResponseJs)
}

/**
 * This is only for testing because it cannot coexist with other route interceptors.
 * @param {Route} route - The route to intercept.
 */
export async function overwriteResponseJs(route) {
    const response = await route.fetch()
    const fulfillOpts = { response }
    if (
        response.ok() &&
        response.headers()["content-type"]?.includes("javascript")
    ) {
        console.log("Rewriting JS from", route.request().url())
        const text = await pCallAsync(async () => response.text())
        if (text instanceof Error) {
            console.error("Failed to read JS response:", text, response)
        } else {
            const rewritten = rewriteJs(text)
            if (rewritten instanceof Error) {
                console.error("Failed to rewrite JS:", rewritten, response)
            } else {
                fulfillOpts.body = rewritten
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
    const /**@type {string[]}*/ imports = []
    const rewritten = rewriteStatements(program.body, source, imports)
    if (rewritten instanceof Error) {
        return rewritten
    } else {
        return `${rewritten.header()}
${imports.join("\n")}
${rewritten.text}`
    }
}

/** Target maximum size per `eval` block is 1kB. */
const MAX_EVAL_SIZE = 1000

/**
 * @param {(Statement | ModuleDeclaration | Expression)[]} statements - Statements in a program or function.
 * @param {string} source - Source code.
 * @param {string[]} imports - `import` statements that must be at the top.
 * @param {boolean?} noRewrite - Do not rewrite the statements at this level. If `undefined`, may rewrite contained statements if suitable.
 */
function rewriteStatements(statements, source, imports, noRewrite = false) {
    const rewritten = new RewrittenStatements()
    let totalLen = 0
    /* console.log(
        statements[0].type,
        source.slice(statements[0].start, statements[0].start + 30),
        "...",
        source.slice(
            statements[statements.length - 1].end - 29,
            statements[statements.length - 1].end + 1,
        ),
        statements[statements.length - 1].end - statements[0].start,
        noRewrite,
    ) //DBG */

    for (const statement of statements) {
        const t = statement.type
        const span = source.slice(statement.start, statement.end)
        const effectiveLen = Buffer.byteLength(span, "utf8")
        const rewrittenStmt = new RewrittenStatement(span, effectiveLen)
        let /**@type{(Statement | Expression)[]}*/ bodyArr = []
        let /**@type{(Statement | Expression)[]}*/ checkArr = []
        let /**@type{RewrittenStatement[]?}*/ rewrittenArr = rewritten.regular
        let separateScope = false
        let nestedNoRewrite = noRewrite

        if (t === "ClassDeclaration") {
            // TODO: Perhaps break down large classes.
            rewrittenArr = rewritten.hoisting
            separateScope = true
        } else if (t === "FunctionDeclaration") {
            bodyArr = statement.body.body
            rewrittenArr = rewritten.hoisting
            separateScope = true
            if (statement.generator) {
                if (nestedNoRewrite === false) {
                    // Do not rewrite in generators.
                    nestedNoRewrite = null
                }
            } else {
                separateScope = true
            }
        } else if (t === "ImportDeclaration") {
            imports.push(span)
            rewrittenArr = null
        } else if (
            t === "ExportDefaultDeclaration" ||
            t === "ExportNamedDeclaration" ||
            t === "ExportAllDeclaration"
        ) {
            return new ExportUnsupportedErr()
        } else if (t === "VariableDeclaration") {
            const declarations =
                statement.kind === "var" ? rewritten.vars : rewritten.lets
            for (const decl of statement.declarations) {
                if (decl.id.type === "Identifier") {
                    declarations.add(decl.id.name)
                }
                if (decl.init != null) {
                    checkArr.push(decl.init)

                    // Generate the declaration text.
                    const declSpan = source
                        .slice(decl.start, decl.end + 1)
                        .trimEnd()
                    const effectiveLen = declSpan.length
                    const declText = declSpan.endsWith(",")
                        ? declSpan.slice(0, -1)
                        : declSpan
                    const stmt = new RewrittenStatement(declText, effectiveLen)
                    rewritten.regular.push(stmt)
                    totalLen += effectiveLen
                }
            }
            rewrittenArr = null
        } else if (t === "ExpressionStatement") {
            bodyArr.push(statement.expression)
        } else if (t === "BlockStatement") {
            bodyArr = statement.body
        } else if (
            t === "EmptyStatement" ||
            t === "DebuggerStatement" ||
            t === "BreakStatement" ||
            t === "ContinueStatement" ||
            t === "Identifier" ||
            t === "Literal" ||
            t === "ThisExpression" ||
            t === "MetaProperty"
        ) {
            // No op.
        } else if (t === "WithStatement") {
            checkArr.push(statement.object)
            bodyArr.push(statement.body)
        } else if (t === "LabeledStatement") {
            bodyArr.push(statement.body)
            if (nestedNoRewrite === false) {
                // Do not rewrite in labeled statements.
                nestedNoRewrite = null
            }
        } else if (
            t === "ReturnStatement" ||
            t === "ThrowStatement" ||
            t === "UnaryExpression" ||
            t === "UpdateExpression" ||
            t === "YieldExpression"
        ) {
            if (statement.argument != null) {
                bodyArr.push(statement.argument)
            }
        } else if (t === "IfStatement") {
            checkArr.push(statement.test)
            if (statement.alternate != null) {
                // NOTE: We do not rewrite `alternate` to avoid the complexity of
                // also rewriting `consequent`.
                checkArr.push(statement.alternate)
            }
        } else if (t === "SwitchStatement") {
            // NOTE: We do not rewrite `switch` statements to avoid complexity.
            checkArr.push(statement.discriminant)
            for (const caseClause of statement.cases) {
                if (caseClause.test != null) {
                    checkArr.push(caseClause.test)
                }
                checkArr.push(...caseClause.consequent)
            }
            if (nestedNoRewrite === false) {
                // Do not rewrite in switch statements.
                nestedNoRewrite = null
            }
        } else if (t === "TryStatement") {
            bodyArr = statement.block.body
            if (statement.handler != null) {
                checkArr.push(...statement.handler.body.body)
            }
            if (statement.finalizer != null) {
                checkArr.push(...statement.finalizer.body)
            }
        } else if (t === "WhileStatement" || t === "DoWhileStatement") {
            checkArr.push(statement.test)
            bodyArr.push(statement.body)
            if (nestedNoRewrite === false) {
                // Do not rewrite in while loops.
                nestedNoRewrite = null
            }
        } else if (t === "ForStatement") {
            if (
                statement.init != null &&
                statement.init.type !== "VariableDeclaration"
            ) {
                checkArr.push(statement.init)
            }
            checkArr.push(
                ...[statement.test, statement.update].filter((s) => s != null),
            )
            bodyArr.push(statement.body)
            if (nestedNoRewrite === false) {
                // Do not rewrite in for loops.
                nestedNoRewrite = null
            }
        } else if (t === "ForInStatement" || t === "ForOfStatement") {
            checkArr.push(statement.right)
            bodyArr.push(statement.body)
            if (nestedNoRewrite === false) {
                // Do not rewrite in for loops.
                nestedNoRewrite = null
            }
        } else if (t === "ArrayExpression") {
            for (const elem of statement.elements) {
                if (elem != null) {
                    if (elem.type === "SpreadElement") {
                        checkArr.push(elem.argument)
                    } else {
                        checkArr.push(elem)
                    }
                }
            }
        } else if (t === "ObjectExpression") {
            for (const prop of statement.properties) {
                if (prop.type === "SpreadElement") {
                    checkArr.push(prop.argument)
                } else {
                    checkArr.push(prop.value)
                }
            }
        } else if (t === "FunctionExpression") {
            bodyArr = statement.body.body
            if (statement.generator) {
                if (nestedNoRewrite === false) {
                    // Do not rewrite in generators.
                    nestedNoRewrite = null
                }
            } else {
                separateScope = true
            }
        } else if (t === "BinaryExpression") {
            // NOTE: We do not rewrite LHS to avoid complexity.
            if (statement.left.type !== "PrivateIdentifier") {
                checkArr.push(statement.left)
            }
            bodyArr.push(statement.right)
        } else if (t === "AssignmentExpression") {
            bodyArr.push(statement.right)
        } else if (t === "LogicalExpression") {
            // NOTE: We do not rewrite LHS to avoid complexity.
            checkArr.push(statement.left)
            bodyArr.push(statement.right)
        } else if (t === "MemberExpression") {
            if (statement.object.type !== "Super") {
                bodyArr.push(statement.object)
            }
            if (statement.property.type !== "PrivateIdentifier") {
                checkArr.push(statement.property)
            }
        } else if (t === "ConditionalExpression") {
            checkArr.push(
                statement.test,
                statement.consequent,
                statement.alternate,
            )
        } else if (t === "CallExpression") {
            if (statement.callee.type !== "Super") {
                bodyArr.push(statement.callee)
            }
            for (const arg of statement.arguments) {
                if (arg.type === "SpreadElement") {
                    checkArr.push(arg.argument)
                } else {
                    checkArr.push(arg)
                }
            }
        } else if (t === "NewExpression") {
            checkArr.push(statement.callee)
            for (const arg of statement.arguments) {
                if (arg.type === "SpreadElement") {
                    checkArr.push(arg.argument)
                } else {
                    checkArr.push(arg)
                }
            }
        } else if (t === "SequenceExpression" || t === "TemplateLiteral") {
            checkArr = statement.expressions
        } else if (t === "ArrowFunctionExpression") {
            if (statement.body.type === "BlockStatement") {
                bodyArr = statement.body.body
            } else {
                bodyArr.push(statement.body)
            }
        } else if (t === "TaggedTemplateExpression") {
            checkArr.push(statement.tag, statement.quasi)
        } else if (t === "ClassExpression") {
            // TODO: Perhaps break down large classes.
            separateScope = true
        } else if (t === "AwaitExpression") {
            bodyArr.push(statement.argument)
            rewrittenStmt.hasAwait = true
        } else if (t === "ChainExpression" || t === "ParenthesizedExpression") {
            bodyArr.push(statement.expression)
        } else if (t === "ImportExpression") {
            bodyArr.push(statement.source)
            if (statement.options != null) {
                bodyArr.push(statement.source)
            }
        } else {
            return new UnknownNodeErr(statement)
        }

        if (checkArr.length > 0) {
            /* console.log("checkArr", t) //DBG */
            const rewrittenExpr = rewriteStatements(
                checkArr,
                source,
                imports,
                true,
            )
            if (rewrittenExpr instanceof Error) {
                return rewrittenExpr
            }
            rewrittenStmt.hasAwait ||= rewrittenExpr.hasAwait
        }

        if (separateScope) {
            // Prevents `await` from leaking out of the scope.
            rewrittenStmt.hasAwait = false
        }
        if (!noRewrite && bodyArr.length > 0 && effectiveLen > MAX_EVAL_SIZE) {
            /* console.log("bodyArr", t, separateScope, noRewrite, nestedNoRewrite) //DBG */
            // Break down the statement into `eval` blocks.
            const textRewritten = rewriteStatements(
                bodyArr,
                source,
                imports,
                separateScope ? false : nestedNoRewrite,
            )
            if (textRewritten instanceof Error) {
                return textRewritten
            }
            const bodyStart = bodyArr[0].start
            const bodyEnd = bodyArr[bodyArr.length - 1].end
            const header = source.slice(statement.start, bodyStart)
            const footer = source.slice(bodyEnd, statement.end)
            rewrittenStmt.text = `${header}${textRewritten.text}${footer}`
            rewrittenStmt.effectiveLen =
                header.length + textRewritten.effectiveLen + footer.length
        }

        if (rewrittenArr != null) {
            rewrittenArr.push(rewrittenStmt)
            totalLen += effectiveLen
        } else if (rewrittenStmt.hasAwait && rewritten.regular.length > 0) {
            // This is so that `await` in variable declarations are recorded.
            rewritten.regular[rewritten.regular.length - 1].hasAwait = true
        }
    }

    /* console.log(
        statements[0].type,
        source.slice(statements[0].start, statements[0].start + 30),
        "...",
        source.slice(
            statements[statements.length - 1].end - 29,
            statements[statements.length - 1].end + 1,
        ),
        totalLen,
        noRewrite,
    ) //DBG */
    const varDecls =
        rewritten.vars.size > 0 ? `var ${[...rewritten.vars].join(",")}\n` : ""
    const letDecls =
        rewritten.lets.size > 0 ? `let ${[...rewritten.lets].join(",")}\n` : ""
    if (noRewrite === false && totalLen > MAX_EVAL_SIZE) {
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
            // TODO: Double check the `async` modifier does work.
            const hasAwait = prevBlock.some((s) => s.hasAwait)
            const evalBlock = makeEvalBlock(prevBlock, hasAwait)
            block.push(new RewrittenStatement(evalBlock, 0, hasAwait))
            return block
        })
        const text = nestedBlocks.map((block) => block.text).join("\n")
        const effectiveLen = nestedBlocks
            .map((block) => block.effectiveLen)
            .reduce((a, b) => a + b)
        const hasAwait = nestedBlocks.some((s) => s.hasAwait)
        return new RewrittenStatement(
            varDecls + letDecls + text,
            effectiveLen,
            hasAwait,
        )
    } else {
        const allStatements = rewritten.allStatements()
        const text = allStatements.map((statement) => statement.text).join("\n")
        const hasAwait = allStatements.some((s) => s.hasAwait)
        return new RewrittenStatement(
            varDecls + letDecls + text,
            totalLen,
            hasAwait,
        )
    }
}

/**
 * We cannot rewrite scripts that use `export` statements because they do not work in `eval`, hence this error.
 */
export class ExportUnsupportedErr extends Error {}

export class UnknownNodeErr extends Error {
    /**
     * @param {never} node
     */
    constructor(node) {
        super("Unknown node type")
        return node && undefined
    }
}

/** Group rewritten statements into an `eval` block.
 * @param {RewrittenStatement[]} rStatementArr - Array of `rewrittenStatement`s to group into an `eval` block.
 * @param {boolean} hasAwait
 */
function makeEvalBlock(rStatementArr, hasAwait) {
    const content = rStatementArr
        .map((statement) => escapeBackticksSlashes(statement.text))
        .join("\n")
    const effectiveLen = rStatementArr
        .map((statement) => statement.effectiveLen)
        .reduce((a, b) => a + b)
    // Unicode to avoid collisions. "圏" means "sphere".
    return `var 圏 = ${hasAwait ? "await " : ""}eval(\`${effectiveLenHeader(effectiveLen)}
(${hasAwait ? "async " : ""}function(){
${content}
return "⭕圏"
}).call(this)\`);
if (圏 !== "⭕圏") {
    return 圏;
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
 * @field {RewrittenStatement[]} hoisting - Statements that are evaluated first.
 * @field {RewrittenStatement[]} regular - Regular statements.
 * @field {Set<string>} vars - `var` declarations.
 * @field {Set<string>} lets - `let` or `const` declarations.
 */
export class RewrittenStatements {
    constructor() {
        const /** @type {RewrittenStatement[]} */ hoisting = []
        this.hoisting = hoisting
        const /** @type {RewrittenStatement[]} */ regular = []
        this.regular = regular
        const /** @type {Set<string>} */ vars = new Set()
        this.vars = vars
        const /** @type {Set<string>} */ lets = new Set()
        this.lets = lets
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
 * @field {boolean} leaky - If something inside is leaky, so it may not work inside `eval`.
 * @field {boolean} hasAwait - If contains `await` expression.
 */
export class RewrittenStatement {
    /**
     * @param {string} text - Source or modified source of the statement.
     * @param {number} effectiveLen - The length when ignoring nested `eval` inside.
     * @param {boolean} hasAwait - If contains `await` expression.
     */
    constructor(text, effectiveLen, hasAwait = false) {
        this.text = text
        this.effectiveLen = effectiveLen
        this.hasAwait = hasAwait
    }

    /**
     * JSphere effectiveLen header.
     */
    header() {
        return effectiveLenHeader(this.effectiveLen)
    }

    toString() {
        return `${this.header()}
${this.text}`
    }
}

/**
 * @param {number} effectiveLen
 */
export function effectiveLenHeader(effectiveLen) {
    return `//${effectiveLen} jsphere effectiveLen`
}
