import config from "@/lib/configs/config";
import { logger } from "@/lib/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// for migrations
const migrationClient = postgres(config.DB_URL, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_DATABASE_NAME,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    max: 1,
});

export default async function migrateDB() {
    logger.info("Started migration");

    const migrationsFolder =
        config.NODE_ENV === "production"
            ? "./dist/src/db/migrations"
            : "./src/db/migrations";

    await migrate(drizzle(migrationClient), {
        migrationsFolder,
    });

    await migrationClient.end();
    logger.info("Finishing migration");
}
