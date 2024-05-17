import { Response, Request, NextFunction } from "express";

export type CatchAsyncProps = (
    req: Request,
    res: Response,
    next?: NextFunction
) => void;

/**
 * A higher-order function that wraps asynchronous request handlers and catches errors.
 *
 * This function helps to avoid repetitive try-catch blocks in asynchronous Express route handlers.
 * If the wrapped function throws an error, the error is passed to the next middleware function,
 * typically an error handler.
 *
 * @function catchAsync
 * @param {CatchAsyncProps} fn - The asynchronous function to wrap.
 * @returns {function} - A new function that wraps the provided function with error handling.
 *
 * @example
 * import { catchAsync } from './path/to/this/module';
 *
 * app.get('/some-route', catchAsync(async (req, res, next) => {
 *     // your async code here
 * }));
 */
export function catchAsync(fn: CatchAsyncProps) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
}

/**
 * Pauses execution for a specified amount of time.
 *
 * This function returns a promise that resolves after a delay, making it useful for
 * creating artificial delays in asynchronous code, such as simulating network latency
 * or waiting for an operation to complete.
 *
 * @function pause
 * @param {number} [delay=200] - The delay time in milliseconds (default is 200ms).
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
export function pause(delay = 200) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}
