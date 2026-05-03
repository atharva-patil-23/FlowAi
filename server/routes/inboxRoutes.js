import { Router } from "express";

import authMiddleware from "../middleware/auth.js";
import { listAssignedTasks } from "../controllers/taskController.js";

const router = Router();

router.use(authMiddleware);

router.get("/tasks", listAssignedTasks);

export default router;
