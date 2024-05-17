import { Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "@/lib/errors";
import validate from "../validate";

// Mock Zod schema for testing
const testSchema: ZodSchema<any> = {
    parse: jest.fn(),
} as unknown as ZodSchema<any>;

describe("validate middleware", () => {
    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            body: {},
        } as unknown as Request;
        res = {} as unknown as Response;
        next = jest.fn();
    });

    it("should call next middleware when request body is valid", () => {
        validate(testSchema)(req, res, next);

        expect(testSchema.parse).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalled();
    });

    it("should throw AppError when request body is invalid", () => {
        const zodError = new ZodError([]);
        (testSchema.parse as jest.Mock).mockImplementationOnce(() => {
            throw zodError;
        });

        validate(testSchema)(req, res, next);

        expect(testSchema.parse).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalledWith(
            new AppError("Invalid body data", httpStatus.BAD_REQUEST, false, [])
        );
    });

    it("should pass other types of errors to the default error handler", () => {
        const otherError = new Error("Some other error");
        (testSchema.parse as jest.Mock).mockImplementationOnce(() => {
            throw otherError;
        });

        validate(testSchema)(req, res, next);

        expect(testSchema.parse).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalledWith(otherError);
    });
});
