import { createClient, RedisClientType } from "redis";
import { mock, MockProxy } from "jest-mock-extended";
import { logger } from "@/lib/logger";
import Cache from "../Cache";
import { getClient } from "..";

jest.mock("redis", () => ({
    createClient: jest
        .fn()
        .mockReturnValue({ on: jest.fn(), connect: jest.fn() }),
}));

jest.mock("../../logger", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    },
}));

jest.mock("../Cache");

const generateCallBack = (
    s: string,
    mockClient: MockProxy<RedisClientType>
) => {
    const callbackArray = mockClient.on?.mock.calls.find(
        (call) => call[0] === s
    );
    return callbackArray ? callbackArray[1] : () => {};
};

describe("getClient", () => {
    let mockClient: MockProxy<RedisClientType>;

    beforeEach(() => {
        mockClient = mock<RedisClientType>({
            on: jest.fn(),
            connect: jest.fn(),
        });
        (createClient as jest.Mock).mockReturnValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test("should create a Redis client", () => {
        getClient();
        expect(createClient).toHaveBeenCalled();
    });

    test("should register event listeners", () => {
        getClient();

        expect(mockClient.on).toHaveBeenCalledWith(
            "ready",
            expect.any(Function)
        );
        expect(mockClient.on).toHaveBeenCalledWith(
            "reconnecting",
            expect.any(Function)
        );
        expect(mockClient.on).toHaveBeenCalledWith("end", expect.any(Function));
        expect(mockClient.on).toHaveBeenCalledWith(
            "disconnected",
            expect.any(Function)
        );
        expect(mockClient.on).toHaveBeenCalledWith(
            "error",
            expect.any(Function)
        );
    });

    test("should call connect on the client", () => {
        getClient();
        expect(mockClient.connect).toHaveBeenCalled();
    });

    test("should create a Cache instance with the client", () => {
        getClient();
        expect(Cache).toHaveBeenCalledWith(mockClient);
    });

    test("should return a Cache instance", () => {
        const cacheInstance = {};
        (Cache as jest.Mock).mockImplementation(() => cacheInstance);

        const result = getClient();
        expect(result).toBe(cacheInstance);
    });

    test("should log 'Redis: Ready' when 'ready' event occurs", () => {
        getClient();
        const readyCallback = generateCallBack("ready", mockClient);
        readyCallback();
        expect(logger.info).toHaveBeenCalledWith("Redis: Ready");
    });

    test("should log 'Redis: Reconnecting' when 'reconnecting' event occurs", () => {
        getClient();
        const reconnectingCallback = generateCallBack(
            "reconnecting",
            mockClient
        );
        reconnectingCallback();
        expect(logger.info).toHaveBeenCalledWith("Redis: Reconnecting");
    });

    test("should log 'Redis: Ended' when 'end' event occurs", () => {
        getClient();
        const reconnectingCallback = generateCallBack("end", mockClient);
        reconnectingCallback();
        expect(logger.info).toHaveBeenCalledWith("Redis: Ended");
    });

    test("should log 'Redis: Error' when 'error' event occurs", () => {
        getClient();
        const reconnectingCallback = generateCallBack("error", mockClient);
        reconnectingCallback();
        expect(logger.fatal).toHaveBeenCalledWith("Redis: Error", undefined);
    });

    test("should log 'Redis: Disconnected' when 'disconnected' event occurs", () => {
        getClient();
        const reconnectingCallback = generateCallBack(
            "disconnected",
            mockClient
        );
        reconnectingCallback();
        expect(logger.error).toHaveBeenCalledWith("Redis: Disconnected");
    });
});
