import express from "express";
import * as businessOwnerServiceController from "../controllers/businessOwnerServiceController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * Business Owner – Services Routes
 * -----------------------------------------------------------------------------
 * All routes:
 * - Require authentication
 * - Restricted to BUSINESS_OWNER role
 */

// Authentication & role guard
router.use(verifySession);
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

/**
 * Get all active compliance services
 * GET /api/services
 */
router.get("/", businessOwnerServiceController.getServices);

/**
 * Get services applicable to the current user's business type
 * GET /api/services/my-applicable
 */
router.get(
  "/my-applicable",
  businessOwnerServiceController.getMyApplicableServices
);

/**
 * Get service providers for a specific compliance item
 * GET /api/services/:id/providers
 */
router.get(
  "/:id/providers",
  businessOwnerServiceController.getServiceProviders
);

/**
 * Get specific service provider details
 * GET /api/services/providers/:providerId
 */
router.get(
  "/providers/:providerId",
  businessOwnerServiceController.getProviderById
);

/**
 * Get compliance service details by ID
 * GET /api/services/:id
 */
router.get("/:id", businessOwnerServiceController.getServiceById);

export default router;
