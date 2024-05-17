import { z } from "zod";

const resourceSchema = z.object({
    name: z.string().trim().min(3, "Name is required"),
    ipAddress: z.string().trim().ip(),
});

export type Resource = z.infer<typeof resourceSchema>;

export default resourceSchema;
