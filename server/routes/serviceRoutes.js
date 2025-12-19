import express from "express";
import * as businessOwnerServiceController from "../controllers/businessOwnerServiceController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

// All routes require authentication
router.use(verifySession);
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

// Get all active compliance items (services)
router.get("/", businessOwnerServiceController.getServices);

// Get services applicable to current user's business type
router.get(
  "/my-applicable",
  businessOwnerServiceController.getMyApplicableServices
);

// Get service providers for a specific compliance item
router.get(
  "/:id/providers",
  businessOwnerServiceController.getServiceProviders
);

// Get specific provider details
router.get(
  "/providers/:providerId",
  businessOwnerServiceController.getProviderById
);

// Get specific service/compliance item details
router.get("/:id", businessOwnerServiceController.getServiceById);

export default router;
