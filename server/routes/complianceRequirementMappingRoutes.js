import express from "express";
import {
  upsertMapping,
  getAllMappings,
  deleteMapping,
  getComplianceGridByBusinessType,
} from "../controllers/complianceRequirementMappingController.js";

import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * MIDDLEWARE:
 * - Verify session
 * - Restrict to ADMIN / SUPER_ADMIN
 */
router.use(
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
);

/**
 * @route POST /compliance-requirement-mappings
 * @description Create or update a mapping between Compliance Requirement and Business Type
 * @access Admin, Super Admin
 */
router.post("/", upsertMapping);

/**
 * @route GET /compliance-requirement-mappings
 * @description Get all mappings (pagination, search, filter)
 * @access Admin, Super Admin
 */
router.get("/", getAllMappings);

/**
 * @route DELETE /compliance-requirement-mappings/:id
 * @description Soft delete a mapping entry
 * @access Admin, Super Admin
 */
router.delete("/:id", deleteMapping);

/**
 * @route GET /compliance-requirement-mappings/grid/:businessTypeId
 * @description Get compliance requirement grid structure for a specific business type
 * @access Admin, Super Admin
 */
router.get("/grid/:businessTypeId", getComplianceGridByBusinessType);

export default router;
