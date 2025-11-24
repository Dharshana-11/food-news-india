import express from "express";
import { verifySession } from "../../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../../middleware/authorizeRolesMiddleware.js";

import {
  getAllComplianceItems,
  addComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
} from "../../controllers/complianceItemController.js";

import ROLES from "../../utils/constants/roles.js";

const router = express.Router();

/**
 * @route   GET /api/compliance-items
 * @desc    Get all compliance items (search + pagination)
 * @access  Super Admin, Admin
 */
router.get(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  getAllComplianceItems
);

/**
 * @route   POST /api/compliance-items
 * @desc    Create a new compliance item
 * @access  Super Admin, Admin
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  addComplianceItem
);

/**
 * @route   PUT /api/compliance-items/:id
 * @desc    Update a compliance item
 * @access  Super Admin, Admin
 */
router.put(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateComplianceItem
);

/**
 * @route   DELETE /api/compliance-items/:id
 * @desc    Soft delete a compliance item (status → trash)
 * @access  Super Admin, Admin
 */
router.delete(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  deleteComplianceItem
);

export default router;
