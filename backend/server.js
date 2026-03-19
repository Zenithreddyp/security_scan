import 'dotenv/config'

import express from "express";

import { router as authRoutes } from "./api/routes/auth.routes.js";
import { router as userRoutes } from "./api/routes/user.routes.js";
import { router as targetRoutes } from "./api/routes/target.routes.js";
import { router as scanRoutes } from "./api/routes/scan.routes.js";

import pool from "./core/config/db.js";

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result);
  // res.send("Backend running");
});


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scanweb", targetRoutes);
app.use("/api/scan", scanRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});