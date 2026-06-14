import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCookie } from "../helper.js";

import {
    createUser,
    findUserByEmail,
    createPasswordResetToken,
    findActiveRefreshSession,
    findValidPasswordResetToken,
    markPasswordResetTokenUsed,
    removeRefreshToken,
    saveRefreshToken,
    touchRefreshSession,
    updateUserPassword,
} from "../../core/models/user.model.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 7;
const RESET_TOKEN_MINUTES = 60;

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: `${REFRESH_TOKEN_DAYS}d`,
    });
    return { accessToken, refreshToken };
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
};

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongEnoughPassword(password) {
    return typeof password === "string" && password.length >= 8;
}

function publicUser(user) {
    return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
    };
}

async function persistRefreshSession(req, userId, refreshToken) {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await saveRefreshToken(
        userId,
        refreshToken,
        req.get("user-agent"),
        req.ip,
        expiresAt
    );
}

export async function register(req, res) {
    try {
        const { full_name, last_name, phoneno, password} = req.body;
        const email = normalizeEmail(req.body.email);

        if (!full_name?.trim() || !isValidEmail(email) || !isStrongEnoughPassword(password)) {
            return res.status(400).json({
                message: "Name, valid email, and a password of at least 8 characters are required",
            });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(full_name.trim(), last_name, phoneno, email, hashedPassword);

        const { accessToken, refreshToken } = generateTokens(user.id);
        await persistRefreshSession(req, user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        res.status(201).json({
            message: "Registration successful",
            accessToken,
            user: publicUser(user),
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function login(req, res) {
    try {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        await persistRefreshSession(req, user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
        res.json({
            message: "Login successful",
            accessToken,
            user: publicUser(user),
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function refreshaccessToken(req, res) {
    try {
        const cookieHeader = req.headers.cookie;
        const token = getCookie(cookieHeader, "refreshToken");

        if (!token) return res.status(401).json({ message: "Refresh token required" });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const session = await findActiveRefreshSession(token);
        if (!session) {
            return res.status(403).json({ message: "Refresh token revoked or invalid" });
        }

        await touchRefreshSession(session.id);

        const accessToken = jwt.sign({ userId: session.user_id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        });
        res.json({
            accessToken,
            user: {
                id: session.user_id,
                full_name: session.full_name,
                email: session.email,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Invalid or expired refresh token",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function logout(req, res) {
    try {
        const userId = req.user.userId;
        await removeRefreshToken(userId);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function requestPasswordReset(req, res) {
    try {
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await findUserByEmail(email);
        const response = {
            message: "If that account exists, a password reset token has been generated",
        };

        if (!user) {
            return res.json(response);
        }

        const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
        const resetToken = await createPasswordResetToken(user.id, expiresAt);

        if (process.env.NODE_ENV !== "production") {
            response.resetToken = resetToken;
            response.expiresAt = expiresAt.toISOString();
        }

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;

        if (!token || !isStrongEnoughPassword(password)) {
            return res.status(400).json({
                message: "A valid reset token and a password of at least 8 characters are required",
            });
        }

        const resetToken = await findValidPasswordResetToken(token);
        if (!resetToken) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await updateUserPassword(resetToken.user_id, hashedPassword);
        await markPasswordResetTokenUsed(resetToken.id);
        await removeRefreshToken(resetToken.user_id);

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
