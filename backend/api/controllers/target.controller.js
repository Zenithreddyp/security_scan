import { findTargetsByUser ,updateTargetLabel} from "../../core/models/target.model.js";

import dns from "dns/promises";
import { parse } from "tldts";
import { findOrCreateTarget } from "../../core/services/target.service.js";

export async function listTargets(req, res) {
    try {
        const targets = await findTargetsByUser(req.user.userId);

        res.json({
            message: "Targets fetched",
            count: targets.length,
            targets: targets,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}


export async function createTarget(req, res) {
    try {
        const target = await findOrCreateTarget(req.user.userId, req.body);

        res.json({
            message: "Target added successfully",
            target,
        });
    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: error.message,
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}




export async function updateTarget(req, res) {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;
        const { label } = req.body; 

        if (!Array.isArray(label)) {
            return res.status(400).json({ message: "Label must be provided as an array" });
        }

        const updatedTarget = await updateTargetLabel(id, user_id, label);

        if (!updatedTarget) {
            return res.status(404).json({ message: "Target not found" });
        }

        res.json({ 
            message: "Target updated successfully", 
            target: updatedTarget 
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}