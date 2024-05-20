import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "@/lib/configs/config";
import * as schema from "./schema";

const client = postgres(config.DB_URL);
const db = drizzle(client, { schema, logger: true });

export default db;
