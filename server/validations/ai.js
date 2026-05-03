import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
    .string()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: "Invalid id" });

export const generateTasksSchema = z.object({
    prompt: z.string().trim().min(5, "Describe the goal in a bit more detail").max(1000),
    count: z.number().int().min(1).max(15).optional().default(6),
});

export const projectIdParamSchema = z.object({
    projectId: objectId,
});
