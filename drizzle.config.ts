import config from "@/lib/configs/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dbCredentials: {
        url: config.DB_URL,
    },
    verbose: true,
    strict: true,
});
