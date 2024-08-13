import {
    pgTable,
    serial,
    varchar,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

// eslint-disable-next-line import/prefer-default-export
export const resource = pgTable(
    "resource",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull().unique(),
        ip: varchar("ip", { length: 225 }).notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => ({
        nameIndex: index("nameIndex").on(table.name),
    })
);
