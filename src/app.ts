import express, { Response, Request } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import httpStatus from "http-status";
import sample from "@/middlewares/sample";
import config from "@/lib/configs/config";
import { expressLogger } from "@/lib/logger";
import { AppError, ErrorHandler } from "@/lib/errors";
import doMath from "./math";

const app = express();

// * middlewares

// custom middleware logger
if (config.NODE_ENV === "development") app.use(expressLogger);

// set security HTTP headers
app.use(helmet());

// parse json request body. Look at express.urlencoded() for urlencoded request body middleware
app.use(express.json());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(
        `Hello Word! ${doMath(5, 5)} ${sample()} ${httpStatus[httpStatus.INTERNAL_SERVER_ERROR]}`
    );
});

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
app.use(ErrorHandler);

export default app;
