import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { logger } from "../logger";
import AppError from "./AppError";

export default function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) {
    let error = err;

    if (!(error instanceof AppError)) {
        // TODO: Add custom error instance checks in your application. Example:
        // if (
        //     error instanceof Prisma.PrismaClientKnownRequestError &&
        //     error.code === "P2002"
        // ) {
        //     return {
        //         status: "Error",
        //         errorType: "Bad Request",
        //         message:
        //             'Duplicate "name" error. A resource cannot have an already existing name.',
        //     };
        // }

        logger.error("Unknown error has occurred!", error);

        error = new AppError(
            "Something went wrong in the server.",
            httpStatus.INTERNAL_SERVER_ERROR
        );
    } else logger.error(error.message, err);

    res.status(error.getStatusCode()).json({
        statusCode: error.getStatusCode(),
        message: error.message,
        errorType: error.getErrorType(),
    });
}
