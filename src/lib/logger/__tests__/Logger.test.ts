import pino from "pino";
import config from "@/lib/configs/config";
import Logger from "../Logger";

jest.mock("../../configs/config.ts");

describe("Testing Logger", () => {
    let logger: Logger;
    const mockPinoLogger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        fatal: jest.fn(),
    } as unknown as pino.Logger<never>;

    beforeEach(() => {
        jest.clearAllMocks();
        logger = new Logger(mockPinoLogger);
    });

    it("should log a debug message", () => {
        logger.debug("debug message");
        expect(mockPinoLogger.debug).toHaveBeenCalledWith("debug message");
    });

    it("should log a debug message with metadata", () => {
        const metadata = { key: "value" };
        logger.debug("debug message", metadata);
        expect(mockPinoLogger.debug).toHaveBeenCalledWith(
            metadata,
            "debug message"
        );
    });

    it("should log an error message", () => {
        logger.error("error message");
        expect(mockPinoLogger.error).toHaveBeenCalledWith("error message");
    });

    it("should log an error message with metadata", () => {
        const metadata = { key: "value" };
        logger.error("error message", metadata);
        expect(mockPinoLogger.error).toHaveBeenCalledWith(
            metadata,
            "error message"
        );
    });

    it("should log an info message", () => {
        logger.info("info message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("info message");
    });

    it("should log an info message with metadata", () => {
        const metadata = { key: "value" };
        logger.info("info message", metadata);
        expect(mockPinoLogger.info).toHaveBeenCalledWith(
            metadata,
            "info message"
        );
    });

    it("should log a warning message", () => {
        logger.warning("warning message");
        expect(mockPinoLogger.warn).toHaveBeenCalledWith("warning message");
    });

    it("should log a warning message with metadata", () => {
        const metadata = { key: "value" };
        logger.warning("warning message", metadata);
        expect(mockPinoLogger.warn).toHaveBeenCalledWith(
            metadata,
            "warning message"
        );
    });

    it("should log a fatal message", () => {
        logger.fatal("fatal message");
        expect(mockPinoLogger.fatal).toHaveBeenCalledWith("fatal message");
    });

    it("should log a fatal message with metadata", () => {
        const metadata = { key: "value" };
        logger.fatal("fatal message", metadata);
        expect(mockPinoLogger.fatal).toHaveBeenCalledWith(
            metadata,
            "fatal message"
        );
    });

    it("should not log anything when NODE_ENV is test", () => {
        (config as any).NODE_ENV = "test";
        logger.debug("debug message");
        logger.error("error message");
        logger.info("info message");
        logger.warning("warning message");
        logger.fatal("fatal message");
        expect(mockPinoLogger.debug).not.toHaveBeenCalled();
        expect(mockPinoLogger.error).not.toHaveBeenCalled();
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
        expect(mockPinoLogger.warn).not.toHaveBeenCalled();
        expect(mockPinoLogger.fatal).not.toHaveBeenCalled();
    });
});
