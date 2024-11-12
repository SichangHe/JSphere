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
    const check = () => {
        const elapsed = Date.now() - start
        if (elapsed < ms) {
            setTimeout(check, ms - elapsed)
        } else {
            callback()
        }
    }
    return setTimeout(check, ms)
}
