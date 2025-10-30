/**
 * sessionRoutes.js
 * ------------------------------------------------------------
 * Defines API routes for managing user sessions.
 * Includes routes for creating, verifying, refreshing, 
 * and logging out sessions.
 * ------------------------------------------------------------
 */

import express from "express";
import {
  createSession,
  logoutSession,
  refreshSession,
} from "../controllers/sessionController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/session
 * @description Creates a new session after user authentication.
 * @access Private (Requires Firebase authentication)
 */
router.post("/", authenticateUser, createSession);

/**
 * @route GET /api/session/verify-session
 * @description Verifies whether the current session is valid.
 * Returns user data if session is active.
 * @access Private (Requires valid session token)
 */
router.get("/verify-session", verifySession, (req, res) => {
  res.json({ message: "Session is valid", user: req.user });
});

/**
 * @route POST /api/session/refresh-session
 * @description Refreshes the session using a valid refresh token.
 * @access Public (Uses refresh token cookie)
 */
router.post("/refresh-session", refreshSession);

/**
 * @route POST /api/session/logout
 * @description Logs out the user and clears session cookies.
 * @access Private
 */
router.post("/logout", logoutSession);

export default router;