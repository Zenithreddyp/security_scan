import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";

import pool from "./core/config/db.js";
import { initSocket } from "./core/config/socket.js";
import { ConsumeScanResults } from "./core/services/scan.service.js";

import { router as authRoutes } from "./api/routes/auth.routes.js";
import { router as userRoutes } from "./api/routes/user.routes.js";
import { router as targetRoutes } from "./api/routes/target.routes.js";
import { router as scanRoutes } from "./api/routes/scan.routes.js";
import { router as findingRoutes } from "./api/routes/finding.routes.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Initialize WebSockets
initSocket(server);

// Middlewares
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Health check route
app.get("/health", async (req, res) => {
    res.status(200).json({
        status: "UP",
        database: "CONNECTED",
        uptime: process.uptime(),
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/target", targetRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/findings", findingRoutes);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    ConsumeScanResults();
});