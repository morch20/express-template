import pino from "pino";
import { pinoHttp } from "pino-http";
import { name } from "../../../package.json";
import Logger from "./Logger";
import config from "../configs/config";

let loggerInstance;

if (config.NODE_ENV !== "production") {
    loggerInstance = pino({
        level: config.LOG_LEVEL,
        redact: {
            paths: ["address", "passport", "phone"],
            remove: true,
        },
        formatters: {
            level(label) {
                return { level: label.toLocaleUpperCase() };
            },
        },
        // timestamp: () => `",timestamp":"${new Date(Date.now()).toISOString()}"`,
        transport: {
            target: "pino-pretty",
        },
    });
} else {
    loggerInstance = pino({
        level: config.LOG_LEVEL,
        redact: {
            paths: ["address", "passport", "phone"],
            remove: true,
        },
        formatters: {
            level(label) {
                return { level: label.toLocaleUpperCase() };
            },
        },
        timestamp: () => `",timestamp":"${new Date(Date.now()).toISOString()}"`,
        transport: {
            target: "pino/file",
            options: {
                destination: `${__dirname}../../../../logs/server.log`,
                mkdir: true,
            },
        },
    });
}

const pinoLogger = loggerInstance.child({ microService: name });
const expressLogger = pinoHttp({
    logger: pinoLogger,
    customLogLevel: (req, res, error) => {
        if (error || res.statusCode >= 500) {
            return "error"; // Log errors with 'error' level for server side errors
        }
        if (res.statusCode >= 400) {
            return "warn"; // Log "errors" with 'warn' level for client side errors
        }
        return "info"; // Log successful requests with 'info' level
    },
    customErrorMessage: (req, res, error) =>
        `${req.method} endpoint: ${req.url} ${res.statusCode} - error: ${error.message}`,
    customSuccessMessage: (req, res, responseTime) =>
        `${req.method} endpoint: ${req.url} ${res.statusCode} in ${responseTime} ms`,
    serializers: {
        req: (value) => ({
            id: value.id,
            query: value.query,
            body: value.body,
            remoteAddress: value.remoteAddress,
            remotePort: value.remotePort,
        }),
        res: () => undefined,
        err: () => undefined,
    },
});
const logger = new Logger(pinoLogger);

export { logger, expressLogger };
