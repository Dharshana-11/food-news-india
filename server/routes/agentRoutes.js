/**
 * agentRoutes.js
 * ============================================================================
 * Routes for business owner to manage their agents
 */

import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import authorizeRoles from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

import {
  getAvailableAgents,
  getMyAgents,
  getAgentDetails,
  inviteAgent,
  updateAgentPermissions,
  removeAgent,
} from "../controllers/agentController.js";

const router = express.Router();

// All routes require authentication + business owner role
router.use(authenticateUser);
router.use(verifySession);
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

/**
 * @route GET /api/agents/available
 * @description Get list of available agents for selection
 * @query {string} search - Search by name/phone
 * @query {string} city - Filter by city
 * @query {number} minRating - Minimum rating
 * @query {number} maxCommission - Maximum commission rate
 */
router.get("/available", getAvailableAgents);

/**
 * @route GET /api/agents/my-agents
 * @description Get business owner's agents (active + pending)
 */
router.get("/my-agents", getMyAgents);

/**
 * @route GET /api/agents/:relationId
 * @description Get single agent details with activity log
 * @param {string} relationId - BusinessAgentRelation ID
 */
router.get("/:relationId", getAgentDetails);

/**
 * @route POST /api/agents/invite
 * @description Send invitation to an agent
 * @body {string} agentId - Agent's user ID
 * @body {number} agreedCommission - Commission amount
 * @body {object} permissions - Permission settings
 */
router.post("/invite", inviteAgent);

/**
 * @route PATCH /api/agents/:relationId/permissions
 * @description Update agent's permissions
 * @param {string} relationId - BusinessAgentRelation ID
 * @body {object} permissions - Updated permissions
 */
router.patch("/:relationId/permissions", updateAgentPermissions);

/**
 * @route DELETE /api/agents/:relationId
 * @description Remove agent from business
 * @param {string} relationId - BusinessAgentRelation ID
 * @body {string} reason - Reason for removal (optional)
 */
router.delete("/:relationId", removeAgent);

export default router;
