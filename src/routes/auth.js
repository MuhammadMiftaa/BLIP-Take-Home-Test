import { Router } from "express";
import * as authHandler from "../handlers/auth.js";
import { validate } from "../middlewares/middleware.js";
import { loginSchema } from "../validation/auth.js";

const router = Router();

//$ Auth route
router.post("/login", validate(loginSchema), authHandler.login);

export default router;
