import app from "./app";
import { logger } from "./lib/logger";
import config from "./lib/configs/config";

const server = app.listen(config.PORT, () => {
    logger.info(`Listening to port: ${config.PORT}`);
});

process.on("SIGTERM", () => {
    server.close(() => {
        logger.fatal("HTTP server closed");
    });
});
