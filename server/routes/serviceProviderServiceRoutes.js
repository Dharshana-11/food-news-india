import express from "express";
import {
  getPendingServices,
  approveService,
  rejectService,
} from "../controllers/serviceProviderServiceController.js";

import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * ADMIN SERVICE APPROVAL ROUTES
 * ============================================================
 * Admin reviews and approves/rejects services
 */

/**
 * Get all services pending approval
 * GET /api/admin/services/pending
 */
router.get(
  "/pending",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getPendingServices
);

/**
 * Approve a service
 * PATCH /api/admin/services/:id/approve
 */
router.patch(
  "/:id/approve",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  approveService
);

/**
 * Reject a service
 * PATCH /api/admin/services/:id/reject
 */
router.patch(
  "/:id/reject",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  rejectService
);

export default router;
