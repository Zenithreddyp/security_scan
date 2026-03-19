// const express = require("express");
import express from "express";
export const router = express.Router();

import { register,login, refreshaccessToken ,logout} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshaccessToken); 
router.post("/logout",authenticateToken, logout);