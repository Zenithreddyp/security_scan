import { createScan, findScansByUser, findScansByTarget } from "../../core/models/scan.model.js";
import { findTargetByUserAndId } from "../../core/models/target.model.js";
import { AddScantoQueue } from "../../core/services/scan.service.js";
import { findOrCreateTarget } from "../../core/services/target.service.js";
import net from "node:net";

export async function initiateScan(req, res) {
    try {
        const user_id = req.user.userId;
        console.log("hello ruinning")

        const { target: body_target, scan_type, protocol, port_range } = req.body;


        if (!body_target) {
            res.status(400).json({ message: "Target not provided" });
            return;
        }

        if (!scan_type) {
            res.status(400).json({ message: "Scan type not provided" });
            return;
        }

        console.log("Target:", body_target, "| Scan Type:", scan_type);

        // const ippatern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(?!$)|$){4}$/;
        const domainPattern = /^(?!-)([A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,}$/;

        let target;

        if (net.isIP(body_target)) {
            const allowedIpScans = ["IP_RECON", "IP_PORT_SCAN"];

            if (!allowedIpScans.includes(scan_type)) {
                res.status(400).json({
                    message: `Invalid scan type '${scan_type}' for an IP target. Allowed scans: ${allowedIpScans.join(",")}`,
                });
                return;
            }

            target = await findOrCreateTarget(user_id, {
                target_ip: body_target,
            });
        } else if (domainPattern.test(body_target)) {
            const allowedDomainScans = ["SSL/TLS", "IP_PORT_SCAN"];

            if (!allowedDomainScans.includes(scan_type)) {
                res.status(400).json({
                    message: `Invalid scan type '${scan_type}' for a Domain target. Allowed scans: ${allowedDomainScans.join(",")}`,
                });
                return;
            }

            target = await findOrCreateTarget(user_id, {
                target_url: body_target,
            });
        } else {
            res.status(400).json({
                message: "Provided Target is neither a domain nor an IP",
                wtthere: target,
            });
            return;
        }

        const scan = await createScan(target.id, scan_type);

        await AddScantoQueue({
            scan: { id: scan.id, type: scan.scan_type, protocol: protocol, port_range: port_range },
            target: {
                id: target.id,
                url: target.target_url,
                ip: target.target_ip,
            },
        });

        res.json({
            message: "Scan added",
            target,
            scan,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
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
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
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
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
