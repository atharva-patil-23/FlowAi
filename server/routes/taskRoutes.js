import { Router } from "express";

import validate from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.js";
import {
    createTaskSchema,
    updateTaskSchema,
    projectIdParamSchema,
    taskIdParamSchema,
} from "../validations/task.js";
import {
    listTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../controllers/taskController.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", validate(projectIdParamSchema, "params"), listTasks);
router.post(
    "/",
    validate(projectIdParamSchema, "params"),
    validate(createTaskSchema),
    createTask
);
router.patch(
    "/:taskId",
    validate(taskIdParamSchema, "params"),
    validate(updateTaskSchema),
    updateTask
);
router.delete(
    "/:taskId",
    validate(taskIdParamSchema, "params"),
    deleteTask
);

export default router;
