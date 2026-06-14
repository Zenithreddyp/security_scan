import "dotenv/config";

import express from "express";
import cors from "cors";
import { router as authRoutes } from "./api/routes/auth.routes.js";
import { router as userRoutes } from "./api/routes/user.routes.js";
import { router as targetRoutes } from "./api/routes/target.routes.js";
import { router as scanRoutes } from "./api/routes/scan.routes.js";
import { router as findingRoutus } from "./api/routes/finding.routes.js";

import pool from "./core/config/db.js";
import http from "http";
import { initSocket } from "./core/config/socket.js";
import { ConsumeScanResults } from "./core/services/scan.service.js";

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get("/health", async (req, res) => {
    res.status(200).json({
        status: "UP",
        database: "CONNECTED",
        uptime: process.uptime(),
    });
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/target", targetRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/findings", findingRoutus);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start consuming scan results from RabbitMQ after server + socket are ready
    ConsumeScanResults();
});
