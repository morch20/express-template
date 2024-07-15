import { z } from "zod";
import { paginationSchema } from "@/lib/validations";

export const resourceSchemaRequest = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be 2 or more characters long.")
        .max(225),
    ip: z.string().trim().ip(),
});

export const resourceSchemaResponse = resourceSchemaRequest.extend({
    updatedAt: z.date(),
    createdAt: z.date(),
    id: z.number().int().positive(),
});

export const resourcesQuerySchema = paginationSchema.extend({
    name: z.string().default(""),
});

export type ResourceResponse = z.infer<typeof resourceSchemaResponse>;
export type ResourceRequest = z.infer<typeof resourceSchemaRequest>;
