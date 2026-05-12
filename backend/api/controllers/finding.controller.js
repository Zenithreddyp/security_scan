import {
    findFindingsByUser,
    listFindingsByScan as findFindingsByScan,
    findFindingById,
    listFindingsByTarget as findFindingsByTarget
} from "../../core/models/finding.model.js";

import { findTargetByUserAndId } from "../../core/models/target.model.js";
import { findScanById } from "../../core/models/scan.model.js";


export async function listFindings(req, res) {
    try {
        const findings = await findFindingsByUser(req.user.userId);

        res.status(200).json({
            message: "All findings fetched",
            count: findings.length,
            findings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}



export async function listFindingsByScan(req, res) {
    try {
        const { scan_id } = req.params;

        const scan = await findScanById(scan_id);
        if (!scan) {
            return res.status(404).json({ message: "Scan not found" });
        }

        const findings = await findFindingsByScan(scan_id);

        res.status(200).json({
            message: "Scan findings fetched",
            scan,
            count: findings.length,
            findings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}



export async function listFindingsByTarget(req, res) {
    try {
        const user_id = req.user.userId;
        const { target_id } = req.params;

        const target = await findTargetByUserAndId(user_id, target_id);
        if (!target) {
            return res.status(404).json({ message: "Target not found" });
        }

        const findings = await findFindingsByTarget(target_id);

        res.status(200).json({
            message: "Target findings fetched",
            target,
            count: findings.length,
            findings,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}




export async function getFindingDetails(req, res) {
    try {
        const { id } = req.params;

        const finding = await findFindingById(id);

        if (!finding) {
            return res.status(404).json({ message: "Finding not found" });
        }

        res.status(200).json(finding);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
}


