import { z } from "zod";

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

export type ResourceResponse = z.infer<typeof resourceSchemaResponse>;
export type ResourceRequest = z.infer<typeof resourceSchemaRequest>;
