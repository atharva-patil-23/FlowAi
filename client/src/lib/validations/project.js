import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(1000).optional().default(""),
    visibility: z.enum(["public", "private"]).default("private"),
});

export const updateProjectSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    completed: z.boolean().optional(),
    visibility: z.enum(["public", "private"]).optional(),
});

export const addMemberSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email"),
    role: z.enum(["editor", "viewer"]).default("editor"),
});
