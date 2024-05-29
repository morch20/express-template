import { createClient, RedisClientType } from "redis";
import { logger } from "../logger";
import Cache from "./Cache";

function getClient() {
    const client: RedisClientType = createClient();

    client.on("ready", () => logger.info("Redis: Ready"));
    client.on("reconnecting", () => logger.info("Redis: Reconnecting"));
    client.on("end", () => logger.info("Redis: Ended"));
    client.on("disconnected", () => logger.error("Redis: Disconnected"));
    client.on("error", (err) => logger.fatal("Redis: Error", err));

    client.connect();

    return new Cache(client);
}

const cache = getClient();

export default cache;
