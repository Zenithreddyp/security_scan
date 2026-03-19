import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
    initiateScan,
    listScans,
    listScansByTarget,
} from "../controllers/scan.controller.js";

export const router = express.Router();

router.post("/addscan", authenticateToken, initiateScan);
router.get("/scans", authenticateToken, listScans);

router.get("/scans/:target_id", authenticateToken, listScansByTarget);
