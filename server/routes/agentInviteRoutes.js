/**
 * agentInviteRoutes.js
 * ============================================================================
 * Routes for agent to manage business owner invitations
 */

import express from "express";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

import {
  getAgentInvites,
  acceptInvite,
  rejectInvite,
} from "../controllers/agentInviteController.js";

const router = express.Router();

// All routes require authentication + agent role
router.use(verifySession);
router.use(authorizeRoles(ROLES.AGENT));

/**
 * @route GET /api/agent-invites
 * @description Get all pending invites for the logged-in agent
 * @access Agent only
 */
router.get("/", getAgentInvites);

/**
 * @route PATCH /api/agent-invites/:relationId/accept
 * @description Accept a pending invitation
 * @param {string} relationId - BusinessAgentRelation ID
 * @access Agent only
 */
router.patch("/:relationId/accept", acceptInvite);

/**
 * @route PATCH /api/agent-invites/:relationId/reject
 * @description Reject a pending invitation
 * @param {string} relationId - BusinessAgentRelation ID
 * @body {string} reason - Optional reason for rejection
 * @access Agent only
 */
router.patch("/:relationId/reject", rejectInvite);

export default router;
