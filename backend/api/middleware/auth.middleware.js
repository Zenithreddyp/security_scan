import jwt from "jsonwebtoken"

export function authenticateToken(req, res, next) {

    console.log("Headers:", req.headers);
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token missingnbj" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired access token" });
    }
}