import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";

import {
    listFindings,
    listFindingsByScan,
    listFindingsByTarget,
    getFindingDetails
} from "../controllers/finding.controller.js";

export const router = express.Router();

router.get("/findings", authenticateToken, listFindings);
router.get("/scan/:scan_id/findings", authenticateToken, listFindingsByScan);

router.get("/target/:target_id/findings", authenticateToken, listFindingsByTarget);

router.get("/finding/:id", authenticateToken, getFindingDetails);