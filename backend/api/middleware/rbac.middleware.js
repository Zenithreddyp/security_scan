import { userHasPermission } from "../../core/models/user.model.js";

export function requirePermission(permissionKey) {
    return async function (req, res, next) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const allowed = await userHasPermission(req.user.userId, permissionKey);

            if (!allowed) {
                return res.status(403).json({ message: "Forbidden" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    };
}