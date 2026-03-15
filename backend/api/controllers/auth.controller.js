import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import { createUser, findUserbyEmail, saveRefreshToken } from "../../core/models/user.model.js";


const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" } 
    );
    const refreshToken = jwt.sign(
        { userId: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};


export async function register(req, res) {
    try {
        const { email, password } = req.body;

        const existingUser = await findUserbyEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }



        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await createUser(email, hashedPassword)

        const { accessToken, refreshToken } = generateTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);

        res.json({
            message: "User registered",
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email }
        });



    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await findUserbyEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);


        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });

    }
}


export async function refreshaccessToken(req, res) {
    try {
        const { token } = req.body;

        if (!token) return res.status(401).json({ message: "Refresh token required" });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });


            const user = await findUserById(decoded.userId);
            if (!user || user.refresh_token !== token) {
                return res.status(403).json({ message: "Refresh token revoked or invalid" });
            }

            const accessToken = jwt.sign(
                { userId: user.id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );

            res.json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}


export async function logout(req, res) {
    try {
        const { userId } = req.body; // In a real app, get this from the access token middleware
        await removeRefreshToken(userId);
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}