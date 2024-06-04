import { AppError } from "@/lib/errors";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware to validate the request body against a provided Zod schema.
 *
 * @param {ZodSchema} schema - The Zod schema to validate the request body, query, or params against.
 * @param {"body" | "query" | "params"} from - The request's object to validate from.
 * @returns {Function} Express middleware function.
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
