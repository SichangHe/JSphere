# The `eval` Trick

Each [direct
`eval`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval)
creates a separate browser execution context, so the idea is to use it to
break down scripts without the need of including additional scripts.
The high-level idea is to split each script and
subsequently each block recursively into blocks of `eval` calls smaller than
1kB (an arbitrary number), and somehow have the whole script behave as before.

- [x] Test run in the browser.
- [x] Crawl top 1000 websites and analyze the logs.

## Why it should work

Direct `eval` calls are executed in the same scope as the caller, with
read-write access to all of the surrounding variables.

## Challenges and workarounds

In reality, the `eval` trick is a giant hack due to the quirks of `eval`.

- [x] Hoisting: some constructs behave as if
    they are evaluated first before the script is run.

    - [x] Top-level functions.

        We simply `eval` them first.

    - [x] Variable declarations.
        Functions cannot capture variables declared in adjacent `eval`s, and
        would capture the variable in the outer scope with
        the same name instead, causing errors.
        Variables created in `eval`
        do not leak out unless they are declared with `var` in non-strict mode.

        We identify all variable declarations in the current scope,
        declare all of them first using `var` or `let`, then
        make sure they are not declared again in the `eval` calls on
        the same level.

        - [ ] *(Deferred)* Some assignments do not have a single variable
            identifier on their left-hand side (LHS), such as destructuring.
            The LHS can contain arbitrary expressions.

            We currently stick `var` to their beginning so most of them work,
            but the assigned variables do not leak out.
            This is usually fine because most such assignments are for
            local variables anyway.

- [x] `return` statements cannot return from inside `eval`.

    For each `eval` block that contains `return` statements not in
    nested functions or classes, we wrap it in
    an immediately invoked function expression (IIFE) so that the
    `return`s are valid.
    We call the IIFE with `.call(this)` to preserve `this`.
    We then check the return value of `eval` and return early it if
    it is not `undefined`.

    - [x] Functions declared in IIFEs do not leak out.

        We declare the function identifiers as variables first, then
        convert all function declarations to assignments of
        function expressions to those variables.

        - [ ] *(Deferred)* This seems to break a few scripts, especially when
            they call functions defined in other scripts.

            No idea for solutions yet because
            the error messages did not reveal the cause.

- [x] `import` statements are not allowed inside `eval`.

    We put them at the top of the script.

- [x] `export` statements are not allowed inside `eval`.

    We keep these scripts as is.

- [x] `break`, `continue` and `yield` statements may not be able to
    reach the correct outer scopes inside `eval`.

    We do not rewrite with `eval` in loops or
    generators until we hit a function or class boundary.

- [x] `await` does not work inside `eval`.

    We `await` on the `eval` and use an async IIFE if an IIFE is used.

- [x] Bloat: deeply nested `eval`s cause mountains of backslashes.

    We use `String.raw` to avoid escaping backslashes and nest nested `eval`
    calls in functions to escape the backticks and `${` at runtime.

- [x] Browser crash with stack size exceeded when nesting `eval` to
    over depth 8.

    We limit the depth of `eval` nesting to 8 and inline the deeper blocks.

## Inherent limitations

- Performance: `eval` disables the JIT and forces slow variable lookups.
- Integrity: e.g., if the website checks the checksum of the script,
    it will fail.
