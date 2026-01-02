/**
 * @file complianceScoreRoutes.js
 * -----------------------------------------------------------------------------
 * Routes related to compliance score calculation for business owners.
 *
 * Notes:
 * - Cleanup & documentation only
 * - No logic or routing changes
 * -----------------------------------------------------------------------------
 */

import express from "express";
import { getMyComplianceScore } from "../controllers/complianceScoreController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

/**
 * Get compliance score for the logged-in business owner
 *
 * @route   GET /api/compliance/me
 * @access  Private (Authenticated users)
 */
router.get("/me", verifySession, getMyComplianceScore);

export default router;
