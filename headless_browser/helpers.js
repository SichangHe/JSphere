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
