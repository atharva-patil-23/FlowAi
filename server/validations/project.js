import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
    .string()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: "Invalid id" });

export const createProjectSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(1000).optional().default(""),
    visibility: z.enum(["public", "private"]).optional().default("private"),
});

export const updateProjectSchema = z
    .object({
        title: z.string().trim().min(1).max(120).optional(),
        description: z.string().trim().max(1000).optional(),
        completed: z.boolean().optional(),
        visibility: z.enum(["public", "private"]).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
        message: "At least one field is required",
    });

export const addMemberSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email"),
    role: z.enum(["editor", "viewer"]).optional().default("editor"),
});

export const projectIdParamSchema = z.object({
    projectId: objectId,
});

export const memberIdParamSchema = z.object({
    projectId: objectId,
    memberId: objectId,
});
