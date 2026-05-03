import { z } from "zod";

import Project from "../models/Project.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { canEdit } from "../lib/authz.js";
import { generateClaudeObject, sanitizeUserInput } from "../lib/ai.js";

const taskSuggestionSchema = z.object({
    tasks: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            priority: z.enum(["High", "Medium", "Low"]),
            tags: z.array(z.string()),
        })
    ),
});

const SYSTEM_PROMPT = `You are a product manager breaking a high-level goal into concrete, actionable tasks for a small team.
Each task should be a discrete unit of work that one person could pick up.
Prefer imperative titles ("Design login screen", "Set up CI pipeline").
Use Low/Medium/High priority thoughtfully — not everything is High.
Return tags as short lowercase keywords (e.g. "design", "backend", "research").`;

export const generateTasks = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canEdit(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes("...") || apiKey.length < 40) {
        return res.status(503).json({
            success: false,
            error: {
                message:
                    "Anthropic API key is not configured. Set ANTHROPIC_API_KEY in server/.env",
            },
        });
    }

    const userPrompt = sanitizeUserInput(req.body.prompt, 1000);
    const count = req.body.count;

    const prompt = `Project: ${project.title}${
        project.description ? `\nProject description: ${project.description}` : ""
    }\n\nGoal from user: ${userPrompt}\n\nReturn exactly ${count} tasks. Each task should have at most 6 short lowercase tags. Titles under 200 chars, descriptions under 1000 chars.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    req.on("close", () => controller.abort());

    try {
        const { object } = await generateClaudeObject({
            schema: taskSuggestionSchema,
            system: SYSTEM_PROMPT,
            prompt,
            abortSignal: controller.signal,
        });
        clearTimeout(timeout);
        const suggestions = (object.tasks || [])
            .slice(0, count)
            .map((t) => ({
                title: (t.title || "").slice(0, 200),
                description: (t.description || "").slice(0, 1000),
                priority: ["High", "Medium", "Low"].includes(t.priority) ? t.priority : "Medium",
                tags: (t.tags || [])
                    .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
                    .slice(0, 6)
                    .map((tag) => tag.trim().slice(0, 40)),
            }));
        res.json({ success: true, data: { suggestions } });
    } catch (err) {
        clearTimeout(timeout);
        console.error("[aiController.generateTasks]", err);
        if (err?.name === "AbortError" || controller.signal.aborted) {
            if (!res.headersSent) {
                return res.status(504).json({
                    success: false,
                    error: { message: "AI generation timed out. Please try again." },
                });
            }
            return;
        }
        if (!res.headersSent) {
            res.status(502).json({
                success: false,
                error: { message: "AI generation failed. Please try again." },
            });
        }
    }
});
