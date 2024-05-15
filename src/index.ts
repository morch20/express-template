import app from "./app";
import { logger } from "./lib/logger";
import config from "./lib/configs/config";

const server = app.listen(config.PORT, () => {
    logger.info(`Listening to port: ${config.PORT}`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: Error) => {
    logger.fatal("unexpectedErrorHandler", error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    logger.fatal("SIGTERM received");
    exitHandler();
});

process.on("SIGINT", () => {
    logger.fatal("SIGINT received");
    exitHandler();
});
