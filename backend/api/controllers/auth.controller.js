import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCookie } from "../helper.js";

import {
    createUser,
    findUserByEmail,
    findUserById,
    removeRefreshToken,
    saveRefreshToken,
    createEmailOtp,
    findLatestOtpByUserId,
    deleteOtpsByUserId,
    updateUserStatus,
} from "../../core/models/user.model.js";

import { sendEmailOtp } from "../../core/services/email.service.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m"; //min
const REFRESH_TOKEN_DAYS = "7d"; //days

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: `REFRESH_TOKEN_DAYS`,
    });
    return { accessToken, refreshToken };
};

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

export async function verifyEmailOtp(req, res) {
    try {
        const { otp } = req.body;
        const email = normalizeEmail(req.body.email);

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

        if (otpRecord.expires_at < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await updateUserStatus(user.id, "verified");

        await deleteOtpsByUserId(user.id);

        const { accessToken, refreshToken } = generateTokens(user.id);

        await saveRefreshToken(user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none", // strict if both are on same domain 
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Email verified successfully",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                status: "verified",
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
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
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
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

        const user = await createUser(full_name, last_name, phoneno, email, hashedPassword,"pending_email_verification");


        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await createEmailOtp(user.id, otpHash, otpExpiresAt);

        await sendEmailOtp(email, otp);

        return res.status(201).json({
            message: "Registration successful. Please check your email for OTP.",
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
        const { email, password } = req.body;

        const user = await findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: "Login successful",
            accessToken,
            user: { id: user.id, email: user.email },
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
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export async function logout(req, res) {
    try {
        const userId = req.user.userId;
        await removeRefreshToken(userId);
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
