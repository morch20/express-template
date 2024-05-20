import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError, ZodSchema, z } from "zod";
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

describe("validate middleware with correct body", () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    const testSchema2 = z.object({
        name: z.string().min(1),
        age: z.number().int().positive(),
    });

    beforeEach(() => {
        req = { body: { name: "John Doe", age: 30 } } as Request;
        res = {} as Response;
        next = jest.fn() as NextFunction;

        // Mock the schema's parse method
        jest.spyOn(testSchema2, "parse");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call next middleware when request body is valid", () => {
        validate(testSchema2)(req, res, next);

        // Check if parse method is called with req.body
        expect(testSchema2.parse).toHaveBeenCalledWith(req.body);

        // Check if next middleware is called
        expect(next).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
});
