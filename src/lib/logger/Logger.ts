import type pino from "pino";
import config from "../configs/config";

export default class Logger {
    /**
     * Initializes the Logger with a pino logger instance.
     * This custom logger **does not** log when the NODE_ENV = "test"
     * @param logger - A pino.Logger instance used for logging.
     */
    constructor(private logger: pino.Logger<never>) {}

    /**
     * Logs a message at the debug level.
     *
     * @param message - The message to log.
     * @param metadata - Additional metadata to include with the log message (optional).
     */
    debug(message: string, metadata?: object): void {
        if (config.NODE_ENV === "test") return;

        if (metadata) {
            this.logger.debug(metadata, message);
        } else {
            this.logger.debug(message);
        }
    }

    /**
     * Logs a message at the error level.
     *
     * @param message - The message to log.
     * @param metadata - Additional metadata to include with the log message (optional).
     */
    error(message: string, metadata?: object): void {
        if (config.NODE_ENV === "test") return;

        if (metadata) {
            this.logger.error(metadata, message);
        } else {
            this.logger.error(message);
        }
    }

    /**
     * Logs a message at the info level.
     *
     * @param message - The message to log.
     * @param metadata - Additional metadata to include with the log message (optional).
     */
    info(message: string, metadata?: object): void {
        if (config.NODE_ENV === "test") return;

        if (metadata) {
            this.logger.info(metadata, message);
        } else {
            this.logger.info(message);
        }
    }

    /**
     * Logs a message at the warning level.
     *
     * @param message - The message to log.
     * @param metadata - Additional metadata to include with the log message (optional).
     */
    warning(message: string, metadata?: object): void {
        if (config.NODE_ENV === "test") return;

        if (metadata) {
            this.logger.warn(metadata, message);
        } else {
            this.logger.warn(message);
        }
    }

    /**
     * Logs a message at the fatal level.
     *
     * @param message - The message to log.
     * @param metadata - Additional metadata to include with the log message (optional).
     */
    fatal(message: string, metadata?: object | undefined): void {
        if (config.NODE_ENV === "test") return;

        if (metadata) {
            this.logger.fatal(metadata, message);
        } else {
            this.logger.fatal(message);
        }
    }
}
