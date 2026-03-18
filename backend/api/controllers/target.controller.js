import { findtargetsbyuser, addTarget_ } from "../../core/models/target.model.js";

import dns from "dns/promises";
import { parse } from "tldts";

export async function getalltargets(req, res) {
    try {
        const targets = await findtargetsbyuser(req.user.userId);

        res.json({
            message: "Targets fetched",
            count: targets.length,
            targets: targets,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function addtarget(req, res) {
    try {
        const data = req.body;
        const user_id = req.user.userId;

        let finalUrl = data.target_url || null;
        let finalIp = data.target_ip || null;

        if (data.target_ip && !data.target_url) {
            try {
                const hostnames = await dns.reverse(data.target_ip);
                finalUrl = hostnames[0] || null;
            } catch (error) {}
        }
        console.log("dome");
        if (!finalUrl && !finalIp) {
            return res.status(400).json({
                message: "Either target_ip or target_url is required",
            });
        }
        console.log("dome2");

        let label = [];
        if (finalUrl) {
            const urlToParse = finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`;

            let parseddata = parse(urlToParse);

            if (parseddata.domainWithoutSuffix) label.push(parseddata.domainWithoutSuffix);

            if (parseddata.publicSuffix) label.push(parseddata.publicSuffix);

            if (parseddata.subdomain) label.push(parseddata.subdomain);
        }


        if (!finalUrl && !finalIp) {
            return res.status(400).json({
                message: "Either target_ip or target_url is required",
            });
        }

        console.log("dome3");

        const target = await addTarget_(user_id, finalUrl, finalIp, label);

        console.log("dome4");
        res.json({
            message: "Target added successfully",
            target,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}
