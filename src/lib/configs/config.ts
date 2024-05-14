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
});

const envVariables = envVariablesSchema.safeParse({
    ...process.env,
    PORT: parseInt(process.env.PORT || "5000", 10),
});
if (!envVariables.success) {
    throw new Error(`Config validation error: ${envVariables.error.message}`);
}

const config = {
    NODE_ENV: envVariables.data.NODE_ENV,
    LOG_LEVEL: envVariables.data.LOG_LEVEL,
    PORT: envVariables.data.PORT,
    DB_URL: envVariables.data.DB_URL,
};

export default config;
