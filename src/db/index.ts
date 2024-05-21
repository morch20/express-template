import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "@/lib/configs/config";
import * as schema from "./schema";

// const client = postgres(config.DB_URL);
const client = postgres(config.DB_URL, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_DATABASE_NAME,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
});
const db = drizzle(client, { schema, logger: true });

export default db;
