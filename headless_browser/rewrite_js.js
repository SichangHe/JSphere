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
import { padNL, pCall, pCallAsync } from "./helpers.js"
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
    try {
        const response = await route.fetch()
        const fulfillOpts = { response }
        if (
            response.ok() &&
            response.headers()["content-type"]?.includes("javascript")
        ) {
            const url = route.request().url()
            console.log("Rewriting JS from", url)
            const text = await pCallAsync(async () => response.text())
            if (text instanceof Error) {
                console.error("Failed to read JS response:", text, response)
            } else {
                // NOTE: Splitting the script into 9 `eval` blocks starts to
                // cause browser crashes.
                const maxEvalSize = Math.max(text.length >> 3, MAX_EVAL_SIZE)
                const rewritten = rewriteJs(text, maxEvalSize)
                if (rewritten instanceof Error) {
                    console.error("Failed to rewrite JS:", rewritten, response)
                } else {
                    console.log("Rewritten JS from", url)
                    fulfillOpts.body = rewritten
                }
            }
        }
        await route.fulfill(fulfillOpts)
    } catch (e) {
        console.log("Failed to try to overwrite JS response:", e)
        await route.continue()
    }
}

/** Function for escaping backticks and slashes to be injected.
 * Unicode function name to be short and non-colliding. "迤" means "extend".
 */
export const ESCAPE_FN_TEXT = `var 迤=s=>"eval(String.raw\`"+s.replace(/\\$/g,"$\${'$$'}").replace(/\`/g,"$\${'\`'}")+"\`)";`

/**
 * @param {string} source - Source of JS script.
 * @param {number} maxEvalSize - Target maximum size per `eval` block.
 */
export function rewriteJs(source, maxEvalSize = MAX_EVAL_SIZE) {
    const program = pCall(() => parse(source, parseOptions))
    if (program instanceof Error) {
        return program
    }
    const /**@type {string[]}*/ imports = []
    const rewritten = rewriteStatements(
        program.body,
        source,
        imports,
        false,
        maxEvalSize,
    )
    if (rewritten instanceof Error) {
        return rewritten
    } else {
        /* console.log("rewritten:", JSON.stringify(rewritten, null, 2)) //DBG */
        const text = rewritten.toNonEvalText()
        return `${effectiveLenHeader(rewritten.effectiveLen)}
${imports.join("")}${ESCAPE_FN_TEXT}
${text}`
    }
}

/** Target maximum size per `eval` block is 1kB. */
const MAX_EVAL_SIZE = 1_000

/**
 * @param {(Statement | ModuleDeclaration | Expression)[]} statements - Statements in a program or function.
 * @param {string} source - Source code.
 * @param {string[]} imports - `import` statements that must be at the top.
 * @param {boolean?} noRewrite - Do not rewrite the statements at this level. If `undefined`, may rewrite contained statements if suitable.
 * @param {number} maxEvalSize - Target maximum size per `eval` block.
 * @returns {RewrittenStatements | Error}
 */
function rewriteStatements(
    statements,
    source,
    imports,
    noRewrite = false,
    maxEvalSize = MAX_EVAL_SIZE,
) {
    const rewriting = new RewritingStatements()
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
        const spanOriginal = source.slice(statement.start, statement.end)
        const span = padNL(spanOriginal)
        const effectiveLen = Buffer.byteLength(spanOriginal, "utf8")
        let /**@type{RewrittenStatement | RewrittenStatements}*/ rewrittenStmt =
                new RewrittenStatement(span, effectiveLen)
        let /**@type{(Statement | Expression)[]}*/ bodyArr = []
        let /**@type{(Statement | Expression)[]}*/ checkArr = []
        let /**@type{(RewrittenStatement | RewrittenStatements)[]?}*/ rewrittenArr =
                rewriting.regular
        let nestedNoRewrite = noRewrite

        if (t === "ClassDeclaration") {
            // TODO: Perhaps break down large classes.
            rewrittenArr = rewriting.hoisting
            rewrittenStmt.separateScope = true
        } else if (t === "FunctionDeclaration") {
            bodyArr = statement.body.body
            rewrittenArr = rewriting.hoisting
            rewrittenStmt.separateScope = true
            if (statement.generator) {
                if (nestedNoRewrite === false) {
                    // Do not rewrite in generators.
                    nestedNoRewrite = null
                }
            } else {
                rewrittenStmt.separateScope = true
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
                statement.kind === "var" ? rewriting.vars : rewriting.lets
            for (const decl of statement.declarations) {
                if (decl.id.type === "Identifier") {
                    declarations.add(decl.id.name)
                }
                if (decl.init != null) {
                    checkArr.push(decl.init)

                    // Generate the declaration text.
                    let declSpan = source
                        .slice(decl.start, decl.end + 1)
                        .trimEnd()
                    const effectiveLen = declSpan.length
                    if (declSpan.endsWith(",")) {
                        declSpan = declSpan.slice(0, -1)
                    }
                    if (decl.id.type !== "Identifier") {
                        // NOTE: This could be a destructuring assignment or something.
                        declSpan = "var " + declSpan.replace(/;+$/, "")
                    }
                    declSpan =
                        declSpan + (declSpan.endsWith(";") ? "\n" : ";\n")
                    const stmt = new RewrittenStatement(declSpan, effectiveLen)
                    rewriting.regular.push(stmt)
                    rewriting.effectiveLen += effectiveLen
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
        } else if (t === "ReturnStatement") {
            if (statement.argument != null) {
                bodyArr.push(statement.argument)
            }
            rewrittenStmt.hasReturn = true
        } else if (
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
                rewrittenStmt.separateScope = true
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
            rewrittenStmt.separateScope = true
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
                maxEvalSize,
            )
            if (rewrittenExpr instanceof Error) {
                return rewrittenExpr
            }
            rewrittenStmt.hasAwait ||= rewrittenExpr.hasAwait
            rewrittenStmt.hasReturn ||= rewrittenExpr.hasReturn
        }

        if (!noRewrite && bodyArr.length > 0 && effectiveLen > maxEvalSize) {
            /* console.log("bodyArr", t, separateScope, noRewrite, nestedNoRewrite) //DBG */
            // Break down the statement into `eval` blocks.
            const textRewritten = rewriteStatements(
                bodyArr,
                source,
                imports,
                rewrittenStmt.separateScope ? false : nestedNoRewrite,
                maxEvalSize,
            )
            if (textRewritten instanceof Error) {
                return textRewritten
            }
            textRewritten.inline = true
            const bodyStart = bodyArr[0].start
            const bodyEnd = bodyArr[bodyArr.length - 1].end
            textRewritten.header = source.slice(statement.start, bodyStart)
            textRewritten.footer = source.slice(bodyEnd, statement.end)
            textRewritten.effectiveLen +=
                textRewritten.header.length + textRewritten.footer.length
            textRewritten.separateScope = rewrittenStmt.separateScope
            rewrittenStmt = textRewritten
        }

        if (rewrittenArr != null) {
            rewrittenArr.push(rewrittenStmt)
            rewriting.effectiveLen += effectiveLen
        } else if (rewriting.regular.length > 0) {
            const lastStmt = rewriting.regular[rewriting.regular.length - 1]
            if (rewrittenStmt.hasAwait) {
                // This is so that `await` in variable declarations are recorded.
                lastStmt.hasAwait = true
            }
            if (rewrittenStmt.hasReturn) {
                // This is so that `return` in variable declarations are recorded.
                lastStmt.hasReturn = true
            }
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
        rewriting.effectiveLen,
        noRewrite,
    ) //DBG */
    return finishRewrite(rewriting, noRewrite, maxEvalSize)
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

/**
 * @param {string} s
 */
function escapeTemplateInner(s) {
    return s.replace(/\$/g, "$${'$$'}").replace(/`/g, "$${'`'}")
}

/**
 * Collection of statements being rewritten.
 * @field {(RewrittenStatement | RewrittenStatements)[]} hoisting - Statements that are evaluated first.
 * @field {(RewrittenStatement | RewrittenStatements)[]} regular - Regular statements.
 * @field {Set<string>} vars - `var` declarations.
 * @field {Set<string>} lets - `let` or `const` declarations.
 * @field {number} effectiveLen - The length when ignoring nested `eval` inside.
 */
export class RewritingStatements {
    constructor() {
        const /** @type {(RewrittenStatement | RewrittenStatements)[]} */ hoisting =
                []
        this.hoisting = hoisting
        const /** @type {(RewrittenStatement | RewrittenStatements)[]} */ regular =
                []
        this.regular = regular
        const /** @type {Set<string>} */ vars = new Set()
        this.vars = vars
        const /** @type {Set<string>} */ lets = new Set()
        this.lets = lets
        this.effectiveLen = 0
    }

    /**
     * All hoisting and regular statements, but not `import` statements.
     */
    allStatements() {
        const /**@type{(RewrittenStatements | RewrittenStatement)[]}*/ decls =
                []
        if (this.vars.size > 0) {
            decls.push(
                new RewrittenStatement(`var ${[...this.vars].join(",")}\n`, 0),
            )
        }
        if (this.lets.size > 0) {
            decls.push(
                new RewrittenStatement(`let ${[...this.lets].join(",")}\n`, 0),
            )
        }
        // How to chain iterators??
        return decls.concat(this.hoisting).concat(this.regular)
    }
}

/**
 * @param {RewritingStatements} rewriting
 * @param {boolean?} noRewrite - Do not rewrite the statements at this level.
 * @param {number} maxEvalSize - Target maximum size per `eval` block.
 */
export function finishRewrite(rewriting, noRewrite, maxEvalSize) {
    if (noRewrite === false && rewriting.effectiveLen > maxEvalSize) {
        // Need to try split the script into `eval` blocks.
        let /**@type{(RewrittenStatement | RewrittenStatements)[]}*/ currentEvalBlock =
                []
        const /**@type{(RewrittenStatement | RewrittenStatements)[][]}*/ evalBlocks =
                []
        let currentLen = 0

        for (const statement of rewriting.allStatements()) {
            if (
                currentLen > 0 &&
                currentLen + statement.effectiveLen > maxEvalSize
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

        const innermostBlock = evalBlocks[evalBlocks.length - 1]
        const effectiveLen = innermostBlock.reduce(
            (a, s) => a + s.effectiveLen,
            0,
        )
        const hasAwait = innermostBlock.some(
            (s) => s.hasAwait && !s.separateScope,
        )
        const hasReturn = innermostBlock.some(
            (s) => s.hasReturn && !s.separateScope,
        )
        let currentStmts = new RewrittenStatements(
            innermostBlock,
            effectiveLen,
            hasAwait,
            hasReturn,
        )
        for (let index = evalBlocks.length - 2; index >= 0; index--) {
            const block = evalBlocks[index]
            const effectiveLen = block.reduce((a, s) => a + s.effectiveLen, 0)
            const hasAwait =
                currentStmts.hasAwait ||
                block.some((s) => s.hasAwait && !s.separateScope)
            const hasReturn =
                currentStmts.hasReturn ||
                block.some((s) => s.hasReturn && !s.separateScope)
            const newStmts = new RewrittenStatements(
                block,
                effectiveLen,
                hasAwait,
                hasReturn,
            )
            newStmts.statements.push(currentStmts)
            currentStmts = newStmts
        }
        return currentStmts
    } else {
        const allStatements = rewriting.allStatements()
        const effectiveLen = allStatements.reduce(
            (a, s) => a + s.effectiveLen,
            0,
        )
        const hasAwait = allStatements.some((s) => s.hasAwait)
        const hasReturn = allStatements.some((s) => s.hasReturn)
        return new RewrittenStatements(
            allStatements,
            effectiveLen,
            hasAwait,
            hasReturn,
        )
    }
}

/**
 * Collection of rewritten statements.
 * @field {(RewrittenStatement | RewrittenStatements)[]} statements - Rewritten statements or blocks.
 * @field {number} effectiveLen - The length when ignoring nested `eval` inside.
 * @field {boolean} hasAwait - If contains `await` expression.
 * @field {boolean} hasReturn - If contains `return` statement.
 * @field {boolean} separateScope - If the statements are in a separate scope than their parent.
 * @field {string} header - Header text for the rewritten statements.
 * @field {string} footer - Footer text for the rewritten statements.
 * @field {boolean} inline - If the block should not be put into a separate `eval`.
 */
export class RewrittenStatements {
    /**
     * @param {(RewrittenStatement | RewrittenStatements)[]} statements - Rewritten statements or blocks.
     * @param {number} effectiveLen - The length when ignoring nested `eval` inside.
     * @param {boolean} hasAwait - If contains `await` expression.
     * @param {boolean} hasReturn - If contains `return` statement.
     */
    constructor(statements, effectiveLen, hasAwait, hasReturn) {
        this.statements = statements
        this.effectiveLen = effectiveLen
        this.hasAwait = hasAwait
        this.hasReturn = hasReturn
        this.separateScope = false
        this.header = ""
        this.footer = ""
        this.inline = false
    }

    toNonEvalText() {
        const text = this.statements.reduce((s, stmts) => {
            if (stmts instanceof RewrittenStatements) {
                if (stmts.inline) {
                    return s + stmts.toNonEvalText()
                }
                const fnHeader = stmts.hasReturn
                    ? `(${stmts.hasAwait ? "async " : ""}function(){\n`
                    : ""
                const fnFooter = stmts.hasReturn
                    ? `return "⭕圏"
}).call(this)\`)
if(圏!=="⭕圏"){return 圏}
`
                    : "`)"
                return `${s}var 圏 = ${stmts.hasAwait ? "await " : ""}eval(String.raw\`${effectiveLenHeader(stmts.effectiveLen)}
${fnHeader}${stmts.toEvalText()}
${fnFooter}`
            } else {
                return s + stmts.text
            }
        }, "")
        return `${this.header}${text}${this.footer}`
    }

    toEvalText() {
        const text = this.statements.reduce((s, stmts) => {
            if (stmts instanceof RewrittenStatements) {
                if (stmts.inline) {
                    return s + stmts.toEvalText()
                }
                const fnHeader = stmts.hasReturn
                    ? `(${stmts.hasAwait ? "async " : ""}function(){\n`
                    : ""
                const fnFooter = stmts.hasReturn
                    ? `return "⭕圏"
}).call(this)\`)}
if(圏!=="⭕圏"){return 圏}
`
                    : "`)}"
                return `${s}var 圏 = ${stmts.hasAwait ? "await " : ""}\${迤(String.raw\`${effectiveLenHeader(stmts.effectiveLen)}
${fnHeader}${stmts.toEvalText()}
${fnFooter}`
            } else {
                return s + escapeTemplateInner(stmts.text)
            }
        }, "")
        return (
            escapeTemplateInner(this.header) +
            text +
            escapeTemplateInner(this.footer)
        )
    }
}

/**
 * @field {string} text - Source or modified source of the statement.
 * @field {number} effectiveLen - The length when ignoring nested `eval` inside.
 * @field {boolean} hasAwait - If contains `await` expression.
 * @field {boolean} hasReturn - If contains `return` statement.
 * @field {boolean} separateScope - If the statement is in a separate scope than its parent.
 */
export class RewrittenStatement {
    /**
     * @param {string} text - Source or modified source of the statement.
     * @param {number} effectiveLen - The length when ignoring nested `eval` inside.
     */
    constructor(text, effectiveLen) {
        this.text = text
        this.effectiveLen = effectiveLen
        this.hasAwait = false
        this.hasReturn = false
        this.separateScope = false
    }
}

/**
 * @param {number} effectiveLen
 */
export function effectiveLenHeader(effectiveLen) {
    return `//${effectiveLen} effectiveLen`
}
