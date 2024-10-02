import express, { Response, Request, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import httpStatus from "http-status";
import config from "@/lib/configs/config";
import { expressLogger, logger } from "@/lib/logger";
import { AppError, errorHandler } from "@/lib/errors";
import api from "./api";

const app = express();

// * middlewares

// custom middleware logger
if (config.NODE_ENV === "development") app.use(expressLogger);

// set security HTTP headers
app.use(helmet());

// parse json request body. Look at express.urlencoded() for urlencoded request body middleware
app.use(express.json());

// * Delegate anything possible (e.g. gzip, SSL, throttling requests or rate limiting, static content)
// * to a reverse proxy like Nginx, HAproxy or cloud vendor services instead
// * since Node is quite bad at doing CPU intensive tasks
// gzip compression
app.use(compression());

// enable cors
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(
        `Hello Word! ${httpStatus[httpStatus.INTERNAL_SERVER_ERROR]}`
    );
});

// all routes here
app.use(api);

// send back a 404 error for any unknown api request
app.all("*", (req, res, next) => {
    next(
        new AppError(
            "Hmmm... It seems that route doesn't exits.",
            httpStatus.NOT_FOUND
        )
    );
});

// handle errors
app.use(
    (
        err: AppError,
        req: Request,
        res: Response,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        next: NextFunction
    ) => {
        const { handledError, isUnknownError } = errorHandler(err);

        if (isUnknownError) logger.error("Unknown error has occurred!", err);
        else logger.warning(err.message, err);

        res.status(handledError.statusCode).json(handledError);
    }
);

export default app;
