import httpStatus from "http-status";
import AppError from "../AppError";

describe("Testing AppError class", () => {
    describe("Testing class", () => {
        test("It should return a throwsErrorFunction error", () => {
            const errorName = "throwsErrorFunction";
            const throwsError = () => {
                throw new AppError(errorName, httpStatus.INTERNAL_SERVER_ERROR);
            };

            expect(throwsError).toThrow(errorName);
        });

        test("It should have a throwsError message for the parent class Error", () => {
            const appError = new AppError(
                "throwsError",
                httpStatus.INTERNAL_SERVER_ERROR
            );

            expect(appError.message).toBe("throwsError");
        });

        test("It should have an undefined stack when NODE_ENV=test", () => {
            const appError = new AppError(
                "throwsError",
                httpStatus.INTERNAL_SERVER_ERROR
            );

            expect(appError.stack).toBeUndefined();
        });

        test("It should have a stack when stack=true", () => {
            const appError = new AppError(
                "throwsError",
                httpStatus.INTERNAL_SERVER_ERROR,
                true
            );

            expect(appError.stack).toBeTruthy();
        });

        test("It should return 500 error type since the statusCode is not a number", () => {
            const appError = new AppError("throwsError", "100_MESSAGE", true);

            expect(appError.getErrorType()).toBe(
                httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            );
        });
    });

    describe("Testing getters", () => {
        test("getStatusCode() should return 500 status code", () => {
            const appError = new AppError(
                "throwsError",
                httpStatus.INTERNAL_SERVER_ERROR
            );

            expect(appError.getStatusCode()).toBe(500);
        });

        test("getErrorType() should return an valid httpStatus error string", () => {
            const appError = new AppError(
                "throwsError",
                httpStatus.INTERNAL_SERVER_ERROR
            );

            expect(appError.getErrorType()).toBe(
                httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
            );
        });
    });
});
