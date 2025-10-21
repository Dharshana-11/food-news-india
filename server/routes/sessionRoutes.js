import express from "express";
import { createSession, logoutSession } from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", createSession);
router.post("/logout", logoutSession);

export default router;