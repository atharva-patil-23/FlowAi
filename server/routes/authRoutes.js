import { Router } from "express";
import validate from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.js";
import { signupSchema, loginSchema } from "../validations/auth.js";
import { signup, login, me } from "../controllers/authController.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
