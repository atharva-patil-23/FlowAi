import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";

const DEFAULT_MODEL = "claude-sonnet-4-6";

export const claude = anthropic(DEFAULT_MODEL);

export const sanitizeUserInput = (text, maxLen = 2000) => {
    if (typeof text !== "string") return "";
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
};

export const streamClaudeText = ({ system, prompt }) =>
    streamText({ model: claude, system, prompt });

export const generateClaudeText = ({ system, prompt }) =>
    generateText({ model: claude, system, prompt });
