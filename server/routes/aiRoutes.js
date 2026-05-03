import { Router } from "express";

import validate from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.js";
import rateLimit from "../middleware/rateLimit.js";
import {
    generateTasksSchema,
    projectIdParamSchema,
} from "../validations/ai.js";
import { generateTasks } from "../controllers/aiController.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

const aiRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

router.post(
    "/generate-tasks",
    aiRateLimit,
    validate(projectIdParamSchema, "params"),
    validate(generateTasksSchema),
    generateTasks
);

export default router;
