import { AppError } from "@/lib/errors";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware function to validate request data against a provided Zod schema.
 *
 * @param {ZodSchema} schema - The Zod schema to validate the request data against.
 * @param {"body" | "query" | "params"} from - The part of the request to validate (either "body", "query", or "params").
 * @returns {Function} Express middleware function.
 *
 * The middleware validates the specified part of the request (req.body, req.query, or req.params)
 * using the provided Zod schema. If validation succeeds, the request data is replaced with the
 * parsed data. If validation fails, a formatted error response is created and passed to the next
 * error-handling middleware.
 *
 * @example
 * app.post('/endpoint', validate(schema, 'body'), (req, res) => {
 *   // Handle the request with validated req.body
 * });
 */
export default function validate(
    schema: ZodSchema,
    from: "body" | "query" | "params"
) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedBody = schema.parse(req[from]);
            req[from] = parsedBody;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                // Format Zod errors into a more readable structure
                const formattedErrors = err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));

                next(
                    new AppError(
                        "Invalid data",
                        httpStatus.BAD_REQUEST,
                        false,
                        formattedErrors
                    )
                );
            }
            next(err); // Pass other types of errors to the default error handler
        }
    };
}
