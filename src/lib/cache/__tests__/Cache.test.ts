import { RedisClientType } from "redis";
import { logger } from "@/lib/logger";
import Cache from "../Cache";

jest.mock("redis");
jest.mock("../../logger");

describe("Testing Cache class", () => {
    let mockClient: jest.Mocked<RedisClientType>;
    let cache: Cache;

    beforeEach(() => {
        mockClient = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            deleteByPattern: jest.fn(),
            keys: jest.fn(),
            flushAll: jest.fn(),
            quit: jest.fn(),
            on: jest.fn(),
            connect: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<RedisClientType>;

        cache = new Cache(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set a value in the cache", async () => {
        await cache.set("key", "value", 100);

        expect(mockClient.set).toHaveBeenCalledWith("key", "value", {
            EX: 100,
        });
    });

    it("should set value in the cache with default expiration time", async () => {
        await cache.set("key", "value");

        expect(mockClient.set).toHaveBeenCalledWith("key", "value", {
            EX: cache.getDefaultExpirationTime(),
        });
    });

    it("should return log error if setting the cache fails", async () => {
        mockClient.set.mockRejectedValue(new Error("Error"));
        await cache.set("key", "value");

        expect(logger.error).toHaveBeenCalledWith(
            "Error setting cache",
            expect.any(Error)
        );
    });

    it("should get a value from the cache", async () => {
        mockClient.get.mockResolvedValue("value");
        const result = await cache.get("key");

        expect(mockClient.get).toHaveBeenCalledWith("key");
        expect(result).toBe("value");
    });

    it("should return null if getting a value fails", async () => {
        mockClient.get.mockRejectedValue(new Error("Error"));
        const result = await cache.get("key");

        expect(logger.error).toHaveBeenCalledWith(
            "Error getting cache",
            expect.any(Error)
        );
        expect(result).toBeNull();
    });

    it("should delete a value from the cache", async () => {
        mockClient.del.mockResolvedValue(1);
        const result = await cache.del("key");

        expect(mockClient.del).toHaveBeenCalledWith("key");
        expect(result).toBe(1);
    });

    it("should return null if deleting a value fails", async () => {
        mockClient.del.mockRejectedValue(new Error("Error"));
        const result = await cache.del("key");

        expect(logger.error).toHaveBeenCalledWith(
            "Error deleting cache",
            expect.any(Error)
        );
        expect(result).toBeNull();
    });

    it("should delete a pattern value from the cache", async () => {
        mockClient.del.mockResolvedValue(2);
        mockClient.keys.mockResolvedValue(["test-key1", "test-key2"]);
        const result = await cache.deleteByPattern("test-pattern*");

        expect(mockClient.keys).toHaveBeenCalledWith("test-pattern*");
        expect(mockClient.del).toHaveBeenCalledWith(["test-key1", "test-key2"]);
        expect(result).toBe(2);
    });

    it("should return 0 if not key is found in a pattern", async () => {
        mockClient.del.mockResolvedValue(0);
        mockClient.keys.mockResolvedValue([]);
        const result = await cache.deleteByPattern("test-pattern*");

        expect(mockClient.keys).toHaveBeenCalledWith("test-pattern*");
        expect(mockClient.del).toHaveBeenCalledTimes(0);
        expect(result).toBe(0);
    });

    it("should return null if deleting a pattern value fails", async () => {
        mockClient.del.mockRejectedValue(new Error("Error"));
        const result = await cache.deleteByPattern("key");

        expect(logger.error).toHaveBeenCalledWith(
            "Error deleting cache by pattern",
            expect.any(Error)
        );
        expect(result).toBeNull();
    });

    it("should flush the cache", async () => {
        mockClient.flushAll.mockResolvedValue("OK");
        const result = await cache.flush();

        expect(mockClient.flushAll).toHaveBeenCalled();
        expect(result).toBe("OK");
    });

    it("should return null if flushing the cache fails", async () => {
        mockClient.flushAll.mockRejectedValue(new Error("Error"));
        const result = await cache.flush();

        expect(logger.error).toHaveBeenCalledWith(
            "Error flushing cache",
            expect.any(Error)
        );
        expect(result).toBeNull();
    });

    it("should get the default expiration time", () => {
        const expirationTime = cache.getDefaultExpirationTime();

        expect(expirationTime).toBe(3600);
    });

    it("should set the default expiration time", () => {
        cache.setDefaultExpirationTime(7200);
        const expirationTime = cache.getDefaultExpirationTime();

        expect(expirationTime).toBe(7200);
    });

    it("should close the client connection", async () => {
        mockClient.quit.mockResolvedValue("OK");
        const result = await cache.close();

        expect(mockClient.quit).toHaveBeenCalled();
        expect(result).toBe("OK");
    });

    it("should cause error when closing client connection", async () => {
        mockClient.quit.mockRejectedValue(new Error("error"));
        const result = await cache.close();

        expect(logger.error).toHaveBeenCalledWith(
            "Error closing Redis client connection",
            expect.any(Error)
        );
        expect(result).toBeNull();
    });
});
