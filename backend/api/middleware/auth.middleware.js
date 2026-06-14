import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {

    console.log("Headers:", req.headers);
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired access token",er:error });
    }
}


import jwt from "jsonwebtoken";
import { getCookie } from "../helper.js";
import { findUserById } from "../../core/models/user.model.js";
import { isRefreshSessionFamilyActive } from "../../core/models/session.model.js";

export async function authenticate(req, res, next) {
    try {
        let token = null;

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            token = getCookie(req.headers.cookie, "accessToken");
        }

        if (!token) {
            return res.status(401).json({ message: "Access token required" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.status !== "verified") {
            return res.status(403).json({ message: "Email not verified" });
        }

        const sessionActive = await isRefreshSessionFamilyActive(
            decoded.userId,
            decoded.sessionId
        );

        if (!sessionActive) {
            return res.status(401).json({ message: "Session expired or revoked" });
        }

        req.user = {
            userId: decoded.userId,
            sessionId: decoded.sessionId,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}