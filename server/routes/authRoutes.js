/**
 * @file authRoutes.js
 * @description Defines authentication-related API routes such as user verification.
 */

import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { verifyUser, completeProfile } from "../controllers/authController.js";

const router = express.Router();

/**
 * @route GET /api/auth/verify
 * @description Verifies the authenticated user's identity and session.
 * @access Private (Requires valid authentication token)
 *
 * @middleware authenticateUser - Ensures the request is made by an authenticated user.
 * @controller verifyUser - Handles the user verification logic.
 */
router.get("/verify", authenticateUser, verifyUser);

/**
 * @route POST /api/auth/complete-profile
 * @description Completes profile for new users (role + name)
 * @access Private (Requires Firebase authentication)
 * @body { name: string, role: string }
 * @returns { user: Object }
 */
router.post("/complete-profile", authenticateUser, completeProfile);
export default router;
