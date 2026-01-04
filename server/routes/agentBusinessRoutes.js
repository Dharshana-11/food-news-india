/**
 * agentBusinessRoutes.js
 * ============================================================================
 * Routes for agent to access their assigned businesses
 */

import express from "express";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

import {
  getMyBusinesses,
  getBusinessWorkspace,
} from "../controllers/agentBusinessController.js";

const router = express.Router();

// All routes require authentication + agent role
router.use(verifySession);
router.use(authorizeRoles(ROLES.AGENT));

/**
 * @route GET /api/agent/businesses
 * @description Get all active businesses assigned to the agent
 * @access Agent only
 */
router.get("/", getMyBusinesses);

/**
 * @route GET /api/agent/businesses/:relationId/workspace
 * @description Get workspace data for a specific business
 * @param {string} relationId - BusinessAgentRelation ID
 * @access Agent only
 */
router.get("/:relationId/workspace", getBusinessWorkspace);

export default router;
