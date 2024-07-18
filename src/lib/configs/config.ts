import { z } from "zod";
import * as dotenv from "dotenv";
import path from "node:path";

const getEnvFile = () => {
    // Do not need to do anything inside of a docker container/production
    if (process.env.NODE_ENV === "production") return;

    // In development or testing we need to get .env file
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "test")
        dotenv.config({ path: path.join(__dirname, "../../../.env") });

    // In case you try to do: npm run start in your local machine, we need to get the .env file but one folder back more because of /dist
    if (!process.env.NODE_ENV)
        dotenv.config({ path: path.join(__dirname, "../../../../.env") });
};

getEnvFile();

const envVariablesSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug"])
        .default("info"),
    PORT: z.coerce.number().positive(),
    DB_URL: z.string().describe("Database connection url"),
    DB_HOST: z.string().describe("Database host. Ex: localhost or 'db'."),
    DB_PORT: z.coerce.number().positive(),
    DB_DATABASE_NAME: z.string().trim().min(1),
    DB_USERNAME: z.string().trim().min(1),
    DB_PASSWORD: z.string().trim().min(1),
    REDIS_URL: z.string().trim().min(1).describe("Redis connection url"),
});

const envVariables = envVariablesSchema.safeParse(process.env);
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
    REDIS_URL: envVariables.data.REDIS_URL,
};

export default config;
