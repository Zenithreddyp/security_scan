import dns from "dns/promises";
import { parse } from "tldts";
import { createTarget, findTargetsbyUserwithURLorIP } from "../models/target.model.js";

export async function findOrCreateTarget(user_id, data) {
    let finalUrl = data.target_url || null;
    let finalIp = data.target_ip || null;

    if (!finalUrl && !finalIp) {
        throw new Error("Either target_ip or target_url is required");
    }

    let parsedfinalUrl = null;

    if (finalUrl) {
        finalUrl = finalUrl.trim().toLowerCase();

        parsedfinalUrl = finalUrl.replace(/^https?:\/\//, "");
        parsedfinalUrl = parsedfinalUrl.replace(/^www\./, "");
        parsedfinalUrl = parsedfinalUrl.replace(/\/$/, "");
    }

    const existing = await findTargetsbyUserwithURLorIP(user_id, parsedfinalUrl, finalIp);

    if (existing.length > 0) {
        return existing[0];
    }

    let label = data.label || [];

    if (finalUrl) {
        const urlToParse = finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`;

        const parsed = parse(urlToParse);

        if (parsed.domainWithoutSuffix) label.push(parsed.domainWithoutSuffix);
        if (parsed.publicSuffix) label.push(parsed.publicSuffix);
        if (parsed.subdomain) label.push(parsed.subdomain);
    }

    return await createTarget(user_id, parsedfinalUrl, finalIp, label);
}
