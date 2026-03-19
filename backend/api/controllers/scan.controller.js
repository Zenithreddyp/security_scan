import { createScan, findScansByUser, findScansByTarget } from "../../core/models/scan.model.js";
import { findTargetByUserAndId } from "../../core/models/target.model.js";
import { findOrCreateTarget } from "../../core/services/target.service.js";

export async function initiateScan(req, res) {
    try {
        const user_id = req.user.userId;

        const target = await findOrCreateTarget(user_id, {
            target_url: req.body.scan_url,
        });

        const scan = await createScan(target.id, req.body.scan_type);

        res.json({
            message: "Scan added",
            target,
            scan,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function listScans(req, res) {
    try {
        const scans = await findScansByUser(req.user.userId);

        res.status(200).json({
            message: "All scans fetched",
            count: scans.length,
            scans,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function listScansByTarget(req, res) {
    try {
        const user_id = req.user.userId;
        const { target_id } = req.params;

        const scans = await findScansByTarget(user_id, target_id);
        const target = await findTargetByUserAndId(user_id, target_id);

        res.status(200).json({
            message: "Target scans fetched",
            target,
            count: scans.length,
            scans,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
