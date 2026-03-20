import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
    createUser,
    findUserByEmail,
    findUserById,
    removeRefreshToken,
    saveRefreshToken,
} from "../../core/models/user.model.js";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

export async function register(req, res) {
    try {
        const { full_name, last_name, phoneno, email, password } = req.body;

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(full_name, last_name, phoneno, email, hashedPassword);

        const { accessToken, refreshToken } = generateTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.json({
            message: "User registered",
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export async function refreshaccessToken(req, res) {
    try {
        const { token } = req.body;

        if (!token) return res.status(401).json({ message: "Refresh token required" });

        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await findUserById(decoded.userId);
        if (!user || user.refresh_token !== token) {
            return res.status(403).json({ message: "Refresh token revoked or invalid" });
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export async function logout(req, res) {
    try {
        const userId = req.user.userId;
        await removeRefreshToken(userId);
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}
