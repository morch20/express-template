import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// eslint-disable-next-line import/prefer-default-export
export const RESOURCE_TABLE = pgTable("resource", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    ip: varchar("ip", { length: 225 }).notNull(),
});
