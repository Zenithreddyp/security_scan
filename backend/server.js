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

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json(result);
    // res.send("Backend running");
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
});
