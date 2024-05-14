import type pino from "pino";

export default class Logger {
    constructor(private logger: pino.Logger<never>) {}

    debug(message: string, metadata?: object): void {
        if (metadata) {
            this.logger.debug(metadata, message);
        } else {
            this.logger.debug(message);
        }
    }

    error(message: string, metadata?: object): void {
        if (metadata) {
            this.logger.error(metadata, message);
        } else {
            this.logger.error(message);
        }
    }

    info(message: string, metadata?: object): void {
        if (metadata) {
            this.logger.info(metadata, message);
        } else {
            this.logger.info(message);
        }
    }

    warning(message: string, metadata?: object): void {
        if (metadata) {
            this.logger.warn(metadata, message);
        } else {
            this.logger.warn(message);
        }
    }

    fatal(message: string, metadata?: object | undefined): void {
        if (metadata) {
            this.logger.fatal(metadata, message);
        } else {
            this.logger.fatal(message);
        }
    }
}
