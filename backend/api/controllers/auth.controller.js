import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import { getCookie } from "../helper.js";

import {
    createUser,
    findUserByEmail,
    findUserById,
    createEmailOtp,
    findLatestOtpByUserId,
    deleteOtpsByUserId,
    updateUserStatus,
} from "../../core/models/user.model.js";

import {
    createRefreshSession,
    findRefreshSessionByTokenHash,
    revokeRefreshSession,
    revokeRefreshSessionFamily,
    revokeAllRefreshSessionsForUser,
} from "../../core/models/session.model.js";

import { sendEmailOtp } from "../../core/services/email.service.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 7;

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongEnoughPassword(password) {
    if (typeof password !== "string") return false;
    if (password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/`~]/.test(password)) return false;
    return true;
}

function createRawRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAccessToken(userId, sessionId) {
    return jwt.sign(
        {
            userId,
            sessionId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        }
    );
}

function getRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: "/auth",
    };
}

function getClearRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/auth",
    };
}

function getClientIp(req) {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        null
    );
}

async function issueAuthTokens(user, req, res) {
    const familyId = uuidv4();
    const refreshSessionId = uuidv4();

    const rawRefreshToken = createRawRefreshToken();
    const refreshTokenHash = hashToken(rawRefreshToken);

    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

    await createRefreshSession({
        id: refreshSessionId,
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: getClientIp(req),
        expiresAt: refreshExpiresAt,
    });

    const accessToken = generateAccessToken(user.id, familyId);

    res.cookie("refreshToken", rawRefreshToken, getRefreshCookieOptions());

    return accessToken;
}

export async function register(req, res) {
    try {
        const { full_name, last_name, phoneno, password } = req.body;
        const email = normalizeEmail(req.body.email);

        const errors = [];

        if (!full_name?.trim()) errors.push("Name is required");
        if (!isValidEmail(email)) errors.push("A valid email is required");

        if (!isStrongEnoughPassword(password)) {
            errors.push(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            );
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: errors });
        }

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(
            full_name,
            last_name,
            phoneno,
            email,
            hashedPassword,
            "pending_email_verification"
        );

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await deleteOtpsByUserId(user.id);
        await createEmailOtp(user.id, otpHash, otpExpiresAt);

        await sendEmailOtp(email, otp);

        return res.status(201).json({
            message: "Registration successful. Please check your email for OTP.",
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function verifyEmailOtp(req, res) {
    try {
        const { otp } = req.body;
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Valid email is required" });
        }

        if (!otp || typeof otp !== "string") {
            return res.status(400).json({ message: "OTP is required" });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.status === "verified") {
            return res.status(400).json({ message: "Email already verified" });
        }

        const otpRecord = await findLatestOtpByUserId(user.id);

        if (!otpRecord) {
            return res.status(400).json({ message: "OTP not found" });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const verifiedUser = await updateUserStatus(user.id, "verified");

        await deleteOtpsByUserId(user.id);

        const accessToken = await issueAuthTokens(verifiedUser, req, res);

        return res.status(200).json({
            message: "Email verified successfully",
            accessToken,
            user: {
                id: verifiedUser.id,
                email: verifiedUser.email,
                status: verifiedUser.status,
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function login(req, res) {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.status !== "verified") {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }

        const accessToken = await issueAuthTokens(user, req, res);

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                status: user.status,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function refreshaccessToken(req, res) {
    try {
        const cookieHeader = req.headers.cookie;
        const rawRefreshToken = getCookie(cookieHeader, "refreshToken");

        if (!rawRefreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const refreshTokenHash = hashToken(rawRefreshToken);

        const oldSession = await findRefreshSessionByTokenHash(refreshTokenHash);

        if (!oldSession) {
            res.clearCookie("refreshToken", getClearRefreshCookieOptions());

            return res.status(403).json({
                message: "Refresh token revoked or invalid",
            });
        }

        if (oldSession.revoked_at) {
            await revokeRefreshSessionFamily(
                oldSession.family_id,
                "refresh_token_reuse_detected"
            );

            res.clearCookie("refreshToken", getClearRefreshCookieOptions());

            return res.status(403).json({
                message: "Refresh token reuse detected. Please login again.",
            });
        }

        if (new Date(oldSession.expires_at) < new Date()) {
            await revokeRefreshSession(oldSession.id, "expired");

            res.clearCookie("refreshToken", getClearRefreshCookieOptions());

            return res.status(401).json({
                message: "Refresh token expired. Please login again.",
            });
        }

        const user = await findUserById(oldSession.user_id);

        if (!user || user.status !== "verified") {
            await revokeRefreshSessionFamily(oldSession.family_id, "user_invalid");

            res.clearCookie("refreshToken", getClearRefreshCookieOptions());

            return res.status(403).json({
                message: "User is not allowed to refresh token",
            });
        }

        await revokeRefreshSession(oldSession.id, "rotated");

        const newRawRefreshToken = createRawRefreshToken();
        const newRefreshTokenHash = hashToken(newRawRefreshToken);

        const newSessionId = uuidv4();
        const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

        await createRefreshSession({
            id: newSessionId,
            userId: user.id,
            tokenHash: newRefreshTokenHash,
            familyId: oldSession.family_id,
            userAgent: req.headers["user-agent"] || null,
            ipAddress: getClientIp(req),
            expiresAt: refreshExpiresAt,
        });

        const accessToken = generateAccessToken(user.id, oldSession.family_id);

        res.cookie("refreshToken", newRawRefreshToken, getRefreshCookieOptions());

        return res.status(200).json({
            message: "Access token refreshed",
            accessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);

        res.clearCookie("refreshToken", getClearRefreshCookieOptions());

        return res.status(401).json({
            message: "Invalid or expired refresh token",
        });
    }
}

export async function logout(req, res) {
    try {
        const cookieHeader = req.headers.cookie;
        const rawRefreshToken = getCookie(cookieHeader, "refreshToken");

        if (rawRefreshToken) {
            const refreshTokenHash = hashToken(rawRefreshToken);
            const session = await findRefreshSessionByTokenHash(refreshTokenHash);

            if (session) {
                await revokeRefreshSessionFamily(session.family_id, "logout");
            }
        }

        res.clearCookie("refreshToken", getClearRefreshCookieOptions());

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function logoutAll(req, res) {
    try {
        const userId = req.user.userId;

        await revokeAllRefreshSessionsForUser(userId, "logout_all");

        res.clearCookie("refreshToken", getClearRefreshCookieOptions());

        return res.status(200).json({
            message: "Logged out from all devices successfully",
        });
    } catch (error) {
        console.error("Logout all error:", error);

        return res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}