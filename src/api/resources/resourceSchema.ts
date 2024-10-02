import { z } from "zod";
import { paginationSchema } from "@/lib/validations";
import { resource } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

// * Gives type safety and autocomplete for the resources columns

const baseResourceSchema = createSelectSchema(resource, {
    name: z
        .string()
        .trim()
        .min(2, "Name must be 2 or more characters long.")
        .max(225),
    ip: z.string().trim().ip(),
    updatedAt: z.date(),
    createdAt: z.date(),
    id: z.number().int().positive(),
});

export const resourceSchemaRequest = baseResourceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const resourceSchemaResponse = baseResourceSchema.omit({
    // password: true,
});

export const resourcesQuerySchema = paginationSchema.extend({
    name: z.string().default(""),
});

export type ResourceResponse = z.infer<typeof resourceSchemaResponse>;
export type ResourceRequest = z.infer<typeof resourceSchemaRequest>;

// * Example!

// In the constants file
export const OPTIONS = ["value1", "value2", "value3"] as const;

// Using Zod
export const optionsSchema = z.enum(OPTIONS).default("value1");

// Types! this is equal to: type Options = "value1" | "value2" | "value3"
export type Options = (typeof OPTIONS)[number];

// or you could do. this is equal to: type Options2 = "value1" | "value2" | "value3"
export type Options2 = z.infer<typeof optionsSchema>;
