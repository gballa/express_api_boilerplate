import {isProd} from '../lib/util'
import logger from '../lib/logger'

/**
 * Extract an error stack or error message from an Error object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 *
 * @param {Error} error
 * @return {string} - String representation of the error object.
 */
const getErrorMessage = (error) => {
    /**
     * If it exists, prefer the error stack as it usually
     * contains the most detail about an error:
     * an error message and a function call stack.
     */
    if (error.stack) {
        // let newErr = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        // newErr.stack = newErr.stack.split("\n    at ")
        return {
            message: error.message,
            stack: error.stack.split("\n    at ")
        }
    }

    if (typeof error.toString === "function") {
        return error.toString();
    }

    return "";
}

/**
 * Log an error message to stderr.
 *
 * @see https://nodejs.org/dist/latest-v14.x/docs/api/console.html#console_console_error_data_args
 *
 * @param {string} error
 */
const logErrorMessage = (error) => {
    logger.error(error)
}

/**
 * Determines if an HTTP status code falls in the 4xx or 5xx error ranges.
 *
 * @param {number} statusCode - HTTP status code
 * @return {boolean}
 */
const isErrorStatusCode = (statusCode) => {
    return statusCode >= 400 && statusCode < 600;
}

/**
 * Look for an error HTTP status code (in order of preference):
 *
 * - Error object (`status` or `statusCode`)
 * - Express response object (`statusCode`)
 *
 * Falls back to a 500 (Internal Server Error) HTTP status code.
 *
 * @param {Object} options
 * @param {Error} options.err
 * @param {Object} options.res - Express response object
 * @return {number} - HTTP status code
 */
export const getHttpStatusCode = ({err, res}) => {
    /**
     * Check if the error object specifies an HTTP
     * status code which we can use.
     */
    const statusCodeFromError = err.status || err.statusCode;
    if (isErrorStatusCode(statusCodeFromError)) {
        return statusCodeFromError;
    }

    /**
     * The existing response `statusCode`. This is 200 (OK)
     * by default in Express, but a route handler or
     * middleware might already have set an error HTTP
     * status code (4xx or 5xx).
     */
    const statusCodeFromResponse = res.statusCode;
    if (isErrorStatusCode(statusCodeFromResponse)) {
        return statusCodeFromResponse;
    }

    /**
     * Fall back to a generic error HTTP status code.
     * 500 (Internal Server Error).
     *
     * @see https://httpstatuses.com/500
     */
    return 500;
}

/**
 * Generic Express error handler middleware.
 *
 * @param {Error} err - An Error object.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express `next()` function
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
    const errorMessage = getErrorMessage(err);

    logErrorMessage(errorMessage);

    /**
     * If response headers have already been sent,
     * delegate to the default Express error handler.
     */
    if (res.headersSent) {
        return next(err);
    }

    const errorResponse = {
        statusCode: getHttpStatusCode({err, res}),
        body: undefined
    };

    /**
     * Error messages and error stacks often reveal details
     * about the internals of your application, potentially
     * making it vulnerable to attack, so these parts of an
     * Error object should never be sent in a response when
     * your application is running in production.
     */
    if (isProd()) {
        errorResponse.body = errorMessage;
    }

    /**
     * Set the response status code.
     */
    res.status(errorResponse.statusCode);

    /**
     * Send an appropriately formatted response.
     *
     * The Express `res.format()` method automatically
     * sets `Content-Type` and `Vary: Accept` response headers.
     *
     * @see https://expressjs.com/en/api.html#res.format
     *
     * This method performs content negotation.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation
     */
    res.format({
        //
        // Callback to run when `Accept` header contains either
        // `application/json` or `*/*`, or if it isn't set at all.
        //
        "application/json": () => {
            /**
             * Set a JSON formatted response body.
             * Response header: `Content-Type: `application/json`
             */
            res.json({
                status: errorResponse.statusCode,
                data: errorResponse.body || [],
                error: errorMessage || null
            });
        },
        /**
         * Callback to run when none of the others are matched.
         */
        default: () => {
            /**
             * Set a plain text response body.
             * Response header: `Content-Type: text/plain`
             */
            res.type("text/plain").send(errorResponse.body);
        },
    });

    /**
     * Ensure any remaining middleware are run.
     */
    next();
}
