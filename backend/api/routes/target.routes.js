import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { addtarget } from "../controllers/target.controller.js";

export const router = express.Router();

router.get("/addtarget", authenticateToken, addtarget);
