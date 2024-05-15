import { Response, Request, NextFunction } from "express";

export type CatchAsyncProps = (
    req: Request,
    res: Response,
    next?: NextFunction
) => void;

export function catchAsync(fn: CatchAsyncProps) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
}

export function pause(delay = 200) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}
