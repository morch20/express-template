import request from "supertest";
import app from "@/app";
import { Request, Response } from "express";
import httpStatus from "http-status";
import errorHandler from "../ErrorHandler";
import AppError from "../AppError";

describe("ErrorHandler middleware", () => {
    describe("Error handler with supertest", () => {
        test("It should return a 404 error", async () => {
            const response = await request(app).get("/404");
            expect(response.statusCode).toBe(404);
        });
    });

    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
    });

    it("should handle AppError correctly", () => {
        const appError = new AppError("Test Error", httpStatus.BAD_REQUEST);

        errorHandler(appError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: httpStatus.BAD_REQUEST,
            message: "Test Error",
            errorType: "Bad Request",
            data: {},
        });
    });

    it("should handle unknown errors correctly", () => {
        const unknownError = new Error("Unknown Error");

        errorHandler(unknownError as AppError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(
            httpStatus.INTERNAL_SERVER_ERROR
        );
        expect(res.json).toHaveBeenCalledWith({
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Something went wrong in the server.",
            errorType: "Internal Server Error",
            data: {},
        });
    });
});
