import { RedisClientType } from "redis";
import { logger } from "../logger";

export default class Cache {
    private client: RedisClientType;

    private defaultExpirationTime: number;

    constructor(client: RedisClientType) {
        this.client = client;
        this.defaultExpirationTime = 3600;
    }

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

    public async get(key: string): Promise<string | null> {
        try {
            const result = await this.client.get(key);
            logger.info("Flushing cache result", { result });
            return result;
        } catch (error) {
            logger.error("Error getting cache", error as object);
            return null;
        }
    }

    public async flush(): Promise<string | null> {
        try {
            return await this.client.flushAll();
        } catch (error) {
            logger.error("Error flushing cache", error as object);
            return null;
        }
    }

    public getDefaultExpirationTime() {
        return this.defaultExpirationTime;
    }

    public setDefaultExpirationTime(expirationTime: number) {
        this.defaultExpirationTime = expirationTime;
    }

    public async close(): Promise<string> {
        return this.client.quit();
    }
}
