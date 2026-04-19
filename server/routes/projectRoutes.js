import { Router } from "express";

import validate from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.js";
import {
    createProjectSchema,
    updateProjectSchema,
    addMemberSchema,
    projectIdParamSchema,
    memberIdParamSchema,
} from "../validations/project.js";
import {
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
} from "../controllers/projectController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listProjects);
router.post("/", validate(createProjectSchema), createProject);

router.get("/:projectId", validate(projectIdParamSchema, "params"), getProject);
router.patch(
    "/:projectId",
    validate(projectIdParamSchema, "params"),
    validate(updateProjectSchema),
    updateProject
);
router.delete("/:projectId", validate(projectIdParamSchema, "params"), deleteProject);

router.post(
    "/:projectId/members",
    validate(projectIdParamSchema, "params"),
    validate(addMemberSchema),
    addMember
);
router.delete(
    "/:projectId/members/:memberId",
    validate(memberIdParamSchema, "params"),
    removeMember
);

export default router;
