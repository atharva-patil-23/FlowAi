import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText, generateObject } from "ai";

const DEFAULT_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

export const claude = anthropic(DEFAULT_MODEL);

export const sanitizeUserInput = (text, maxLen = 2000) => {
    if (typeof text !== "string") return "";
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
};

export const streamClaudeText = ({ system, prompt, abortSignal }) =>
    streamText({ model: claude, system, prompt, abortSignal });

export const generateClaudeText = ({ system, prompt, abortSignal }) =>
    generateText({ model: claude, system, prompt, abortSignal });

export const generateClaudeObject = ({ schema, system, prompt, abortSignal }) =>
    generateObject({ model: claude, schema, system, prompt, abortSignal });
