import express, { Response, Request } from "express";
import sample from "@/middlewares/sample";
import { logger, expressLogger } from "./lib/logger";
import doMath from "./math";

const app = express();

// middlewares
app.use(expressLogger);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    // here is a comment
    logger.debug("debug log");
    logger.info("/ route hit!");
    logger.warning("warning error");
    logger.error("error log");
    logger.fatal("fatal error");
    res.status(500).send(`Hello Word! ${doMath(5, 5)} ${sample()}`);
});

export default app;
