import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProfile, updatePassword } from "../controllers/user.controller.js";

export const router = express.Router();

router.get("/profile", authenticateToken, getProfile);
router.put("/profile/update/password", authenticateToken, updatePassword);
