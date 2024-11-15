// @ts-check
import { mkdir, rm } from "node:fs/promises"
/**
 * Executes a function and returns its result. If an error occurs, the error is returned instead.
 *
 * @template T
 * @param {() => T} call - The function to be executed.
 * @returns {T | Error}
 */
export function pCall(call) {
    try {
        return call()
    } catch (e) {
        if (!(e instanceof Error)) {
            return new Error(e)
        }
        return e
    }
}

/**
 * Executes an async function and returns its result. If an error occurs, the error is returned instead.
 *
 * @template T
 * @param {() => Promise<T>} call - The function to be executed.
 * @returns {Promise<T | Error>}
 */
export async function pCallAsync(call) {
    try {
        return await call()
    } catch (e) {
        if (!(e instanceof Error)) {
            return new Error(e)
        }
        return e
    }
}

/**
 * Nuke a directory and recreate it.
 * @param {string} path
 */
export async function mkFreshDir(path) {
    await rm(path, { recursive: true, force: true })
    await mkdir(path, { recursive: true })
}

/**
 * Delay for at least `ms` and then call `callback`.
 * Needed because `setTimeout` usually returns early.
 * @param {() => *} callback
 * @param {number} ms - Number of milliseconds to delay for.
 */
export function afterDelay(callback, ms) {
    const start = Date.now()
    let /**@type{DelayTimeout}*/ delayTimeout
    const check = () => {
        const elapsed = Date.now() - start
        if (elapsed < ms) {
            delayTimeout.timeoutObj = afterDelay(check, ms - elapsed).timeoutObj
        } else {
            callback()
        }
    }
    const timeoutObj = setTimeout(check, ms)
    delayTimeout = new DelayTimeout(timeoutObj)
    return delayTimeout
}

/** Wrapper around pointer to NodeJS.Timeout.
 * @field {NodeJS.Timeout} timeoutObj - Pointer to the internal timeout object.
 */
export class DelayTimeout {
    /**
     * @param {NodeJS.Timeout} timeoutObj
     */
    constructor(timeoutObj) {
        this.timeoutObj = timeoutObj
    }

    clearTimeout() {
        clearTimeout(this.timeoutObj)
    }
}

/** Await a promise with a timeout.
 * @template T
 * @param {Promise<T>} promise - Promise to await.
 * @param {number} ms - Number of milliseconds to wait before timing out.
 * @returns {Promise<T>} - Result of the promise if it resolves before the timeout.
 * @throws {TimeoutError} - If the promise does not resolve before the timeout.
 */
export async function timeOut(promise, ms) {
    let /**@type{DelayTimeout | undefined}*/ delayTimeout
    const timer = new Promise((_resolve, reject) => {
        delayTimeout = afterDelay(() => {
            reject(new TimeoutError(ms))
        }, ms)
    })
    try {
        return await Promise.race([timer, promise])
    } finally {
        if (delayTimeout != undefined) {
            delayTimeout.clearTimeout()
        }
    }
}

/** Error thrown when a promise times out. */
export class TimeoutError extends Error {
    /**
     * @param {number} ms - Number of milliseconds that the promise took to time out.
     */
    constructor(ms) {
        super(`Timed out after ${ms}ms`)
        this.ms = ms
    }
}

/**
 * @param {string} s
 */
export function padNL(s) {
    return s.endsWith("\n") ? s : s + "\n"
}
