import express from "express";
import {
  getMyServices,
  getServiceById,
  createService,
  updateService,
  deactivateService,
  activateService,
  submitServiceForApproval,
} from "../controllers/serviceProviderServiceController.js";

import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * SERVICE PROVIDER - MY SERVICES ROUTES
 * ============================================================
 * Service providers manage their service offerings
 */

/**
 * Get all my services
 * GET /api/service-provider/my-services
 * Query params: ?search=text&status=pending_approval|approved|rejected|inactive
 */
router.get(
  "/",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  getMyServices
);

/**
 * Get single service details
 * GET /api/service-provider/my-services/:id
 */
router.get(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  getServiceById
);

/**
 * Create new service
 * POST /api/service-provider/my-services
 * Body: { complianceItemId, price, turnaroundDays }
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  createService
);

/**
 * Update service (price, turnaroundDays only)
 * PUT /api/service-provider/my-services/:id
 * Body: { price?, turnaroundDays? }
 */
router.put(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  updateService
);

/**
 * Deactivate service
 * PATCH /api/service-provider/my-services/:id/deactivate
 */
router.patch(
  "/:id/deactivate",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  deactivateService
);

/**
 * Activate service
 * PATCH /api/service-provider/my-services/:id/activate
 */
router.patch(
  "/:id/activate",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  activateService
);

router.patch(
  "/:id/submit",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  submitServiceForApproval
);

export default router;
