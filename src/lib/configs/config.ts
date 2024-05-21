import { z } from "zod";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const envVariablesSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug"])
        .default("info"),
    PORT: z.number().positive(),
    DB_URL: z.string().describe("Database connection url"),
    DB_HOST: z.string().describe("Database host. Ex: localhost or 'db'."),
    DB_PORT: z.number().positive(),
    DB_DATABASE_NAME: z.string().trim().min(1),
    DB_USERNAME: z.string().trim().min(1),
    DB_PASSWORD: z.string().trim().min(1),
});

const envVariables = envVariablesSchema.safeParse({
    ...process.env,
    PORT: parseInt(process.env.PORT || "5000", 10),
    DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
});
if (!envVariables.success) {
    throw new Error(`Config validation error: ${envVariables.error.message}`);
}

const config = {
    NODE_ENV: envVariables.data.NODE_ENV,
    LOG_LEVEL: envVariables.data.LOG_LEVEL,
    PORT: envVariables.data.PORT,
    DB_URL: envVariables.data.DB_URL,
    DB_HOST: envVariables.data.DB_HOST,
    DB_PORT: envVariables.data.DB_PORT,
    DB_DATABASE_NAME: envVariables.data.DB_DATABASE_NAME,
    DB_USERNAME: envVariables.data.DB_USERNAME,
    DB_PASSWORD: envVariables.data.DB_PASSWORD,
};

export default config;
