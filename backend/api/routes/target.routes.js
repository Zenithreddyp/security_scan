import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { createTarget, listTargets, updateTarget } from "../controllers/target.controller.js";

export const router = express.Router();

router.post("/addtarget", authenticateToken, createTarget);
router.get("/alltargets", authenticateToken, listTargets);
router.put("/target/:id", authenticateToken, updateTarget);
