import config from "@/lib/configs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// for migrations
const migrationClient = postgres(config.DB_URL, { max: 1 });

async function main() {
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./src/db/migrations",
    });

    await migrationClient.end();
}

main();
