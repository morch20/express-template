/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync, pause } from "../functionts";

describe("Testing utilities functions", () => {
    describe("Testing pause function", () => {
        test("should resolve after default delay (200ms)", async () => {
            const start = Date.now();
            await pause(); // Wait for the default delay (200ms)
            const end = Date.now();
            const elapsed = end - start;

            // Check if the elapsed time is within an acceptable range (e.g., within 180-220ms)
            expect(elapsed).toBeGreaterThanOrEqual(180);
            expect(elapsed).toBeLessThanOrEqual(220);
        });

        test("should resolve after custom delay (500ms)", async () => {
            const start = Date.now();
            await pause(500); // Wait for a custom delay (500ms)
            const end = Date.now();
            const elapsed = end - start;

            // Check if the elapsed time is within an acceptable range (e.g., within 480-520ms)
            expect(elapsed).toBeGreaterThanOrEqual(480);
            expect(elapsed).toBeLessThanOrEqual(520);
        });

        test("should resolve immediately for zero delay", async () => {
            const start = Date.now();
            await pause(0); // Wait for zero delay (immediate resolution)
            const end = Date.now();
            const elapsed = end - start;

            // Check if the elapsed time is minimal (e.g., less than 10ms)
            expect(elapsed).toBeLessThan(20);
        });
    });

    describe("Testing catchAsync function", () => {
        test("should call next with error if async function throws an error", async () => {
            const asyncFn = async (
                req: Request,
                res: Response,
                next?: NextFunction
            ) => {
                // Simulate an async operation
                await Promise.resolve();
                if (next) next(new Error("Test error"));
            };

            const req = {} as Request;
            const res = {} as Response;
            const next = jest.fn();

            const wrappedFn = catchAsync(asyncFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        test("should call next without error if async function succeeds", async () => {
            // Mock async function that succeeds
            const asyncFunction = async (
                req: Request,
                res: Response,
                next?: NextFunction
            ) => {
                // Do some async operation (e.g., fetch data from database)
                // Simulate success by not throwing any error
                await Promise.resolve();
            };

            // Create a wrapped async function using catchAsync
            const wrappedAsyncFunction = catchAsync(asyncFunction);

            // Mock Express request, response, and next functions
            const req = {} as Request;
            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            // Call the wrapped async function
            await wrappedAsyncFunction(req, res, next);

            // Expect that next is called without any error
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });

        test("should call next with error if function throws an error without async operation", async () => {
            const asyncFn = (
                req: Request,
                res: Response,
                next?: NextFunction
            ) => {
                // No async operation
                if (next) next(new Error("Test error"));
            };

            const req = {} as Request;
            const res = {} as Response;
            const next = jest.fn();

            const wrappedFn = catchAsync(asyncFn);
            await wrappedFn(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        test("should call next without error if function succeeds without async operation", async () => {
            // Mock function that succeeds
            const asyncFunction = async (
                req: Request,
                res: Response,
                next?: NextFunction
            ) => {
                // Do not some async operation (e.g., fetch data from database)
                // Simulate success by not throwing any error
            };

            // Create a wrapped async function using catchAsync
            const wrappedAsyncFunction = catchAsync(asyncFunction);

            // Mock Express request, response, and next functions
            const req = {} as Request;
            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            // Call the wrapped async function
            await wrappedAsyncFunction(req, res, next);

            // Expect that next is called without any error
            expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
