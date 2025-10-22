import express from "express";
import { createSession, logoutSession } from "../controllers/sessionController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createSession);
router.get("/verify-session", verifySession); // verify active session token
router.post("/logout", logoutSession);

export default router;