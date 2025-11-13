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

// All routes below require admin or super admin
router.use(verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// CRUD-like routes
router.post("/", upsertMapping); // Create or update mapping
router.get("/", getAllMappings); // View all mappings (with pagination, search, etc.)
router.delete("/:id", deleteMapping); // Soft delete

// For admin to preview or edit the grid per business type
router.get("/grid/:businessTypeId", getComplianceGridByBusinessType);

export default router;
