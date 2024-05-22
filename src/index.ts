import "module-alias/register";
import config from "@/lib/configs/config";
import { logger } from "@/lib/logger";
import app from "./app";
import migrateDB from "./db/migrate";

const server = app.listen(config.PORT, async () => {
    logger.info(`Listening to port: ${config.PORT} in ${config.NODE_ENV}`);

    if (config.NODE_ENV === "production") await migrateDB();
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
