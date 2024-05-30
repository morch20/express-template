import { RedisClientType } from "redis";
import { logger } from "../logger";

export default class Cache {
    private client: RedisClientType;

    private defaultExpirationTime: number;

    /**
     * Constructs a Cache instance.
     * @param client - The Redis client instance.
     */
    constructor(client: RedisClientType) {
        this.client = client;
        this.defaultExpirationTime = 3600;
    }

    /**
     * Sets a value in the cache with an optional expiration time.
     * @param key - The key under which the value is stored.
     * @param value - The value to be stored.
     * @param expireAfter - The time in seconds after which the key should expire. Defaults to the default expiration time.
     */
    public async set(
        key: string,
        value: string,
        expireAfter: number = this.defaultExpirationTime
    ): Promise<void> {
        try {
            await this.client.set(key, value, {
                EX: expireAfter,
            });
        } catch (error) {
            logger.error("Error setting cache", error as object);
        }
    }

    /**
     * Retrieves a value from the cache by its key.
     * @param key - The key of the value to retrieve.
     * @returns The value associated with the key, or null if the key does not exist or an error occurs.
     */
    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            logger.error("Error getting cache", error as object);
            return null;
        }
    }

    /**
     * Clears all keys in the cache.
     * @returns A promise that resolves to the Redis response string or null if an error occurs.
     */
    public async flush(): Promise<string | null> {
        try {
            const result = await this.client.flushAll();
            logger.info("Flushing cache result", { result });
            return result;
        } catch (error) {
            logger.error("Error flushing cache", error as object);
            return null;
        }
    }

    /**
     * Gets the default expiration time for cache entries.
     * @returns The default expiration time in seconds.
     */
    public getDefaultExpirationTime() {
        return this.defaultExpirationTime;
    }

    /**
     * Sets the default expiration time for cache entries.
     * @param expirationTime - The new default expiration time in seconds.
     */
    public setDefaultExpirationTime(expirationTime: number) {
        this.defaultExpirationTime = expirationTime;
    }

    /**
     * Closes the Redis client connection.
     * @returns A promise that resolves when the client is successfully closed.
     */
    public async close(): Promise<string> {
        return this.client.quit();
    }
}
