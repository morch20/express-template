import httpStatus, { HttpStatus } from "http-status";
import config from "../configs/config";

export default class AppError extends Error {
    public message: string;

    private statusCode: number;

    private errorType: string;

    private metadata: object;

    /**
     * Creates an instance of AppError.
     * @param message A descriptive message for the error.
     * @param statusCode The HTTP status code associated with the error (must be a **number** of keyof HttpStatus).
     * @param showStack Flag to indicate whether to include stack trace in error message (default: false).
     * @param metadata An object that contains extra information that can be shown to users
     */
    constructor(
        message: string,
        statusCode: keyof HttpStatus,
        showStack: boolean = false,
        metadata: object = {}
    ) {
        super(message);
        this.message = message;
        this.metadata = metadata;
        this.statusCode = Number(statusCode) || 500;

        this.errorType = httpStatus[
            this.statusCode as keyof HttpStatus
        ] as string;

        if (config.NODE_ENV === "production" || showStack) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = undefined;
        }
    }

    /**
     * Retrieves the HTTP status code associated with the error.
     * @returns The HTTP status code (number).
     */
    getStatusCode() {
        return this.statusCode;
    }

    /**
     * Retrieves the descriptive error type associated with the HTTP status code.
     * @returns The error type description (string).
     */
    getErrorType() {
        return this.errorType;
    }

    /**
     * Retrieves the metadata object type associated with the error.
     * @returns The object type metadata (object).
     */
    getMetaData() {
        return this.metadata;
    }
}
