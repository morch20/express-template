import httpStatus, { HttpStatus } from "http-status";
import config from "../configs/config";

export default class AppError extends Error {
    public message: string;

    private statusCode: number;

    private errorType: string;

    constructor(
        message: string,
        statusCode: keyof HttpStatus,
        showStack: boolean = false
    ) {
        super(message);
        this.message = message;
        this.errorType = httpStatus[statusCode] as string;
        this.statusCode = Number(statusCode) || 500;

        if (config.NODE_ENV === "production" || showStack) {
            Error.captureStackTrace(this, this.constructor);
        } else this.stack = undefined;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getErrorType() {
        return this.errorType;
    }
}
