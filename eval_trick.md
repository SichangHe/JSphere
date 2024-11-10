# The `eval` Trick

Each [direct
`eval`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval)
creates a separate browser execution context, so the idea is to use it to
break down scripts without the need of including additional scripts.
The high-level idea is to split each script and
subsequently each block recursively into blocks of `eval` calls smaller than
1kB (an arbitrary number), and somehow have the whole script behave as before.

## Why it should work

Direct `eval` calls are executed in the same scope as the caller, with
read-write access to all of the surrounding variables.

## Challenges and workarounds

In reality, the `eval` trick is a giant hack due to the quirks of `eval`.

- [ ] Hoisting: some constructs behave as if
    they are evaluated first before the script is run.

    - [x] Top-level functions.

    We simply `eval` them first.
    - [ ] `var` declarations.

        We need to identify all of them and declare them at the top.

- [ ] `return` statements cannot return from inside `eval`.

    We wrap every `eval` in an immediately invoked function expression (IIFE)
    so that the `return`s are valid.
    We call the IIFE with `.call(this)` to preserve `this`.
    We then check the return value of `eval` and return early it if
    it is not `undefined`.

- [x] `import` statements are not allowed inside `eval`.

    We put them at the top of the script.

- [x] `export` statements are not allowed inside `eval`.

    We keep these scripts as is.

- [ ] `break`, `continue` and `yield` statements may not be able to
    reach the correct outer scopes inside `eval`.

    We keep such portions of the script as is.

- [ ] Variables created in `eval`
    do not leak out unless they are declared with `var` in non-strict mode.

    We go deeper and deeper into nested `eval`s, so
    later statements can access variables from the previous ones.

- [ ] `await` does not work inside `eval`.

    If a script uses `await`, we use an async IIFE and `await` on the `eval`.

## Inherent limitations

- Performance: `eval` disables the JIT and forces slow variable lookups.
