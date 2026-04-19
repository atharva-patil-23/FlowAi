import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(2000).optional().default(""),
    priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
    status: z.enum(["Todo", "Inprogress", "Completed"]).default("Todo"),
    assignedTo: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial();
