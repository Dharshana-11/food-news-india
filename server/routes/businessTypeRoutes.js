import express from "express";
import {
  getAllBusinessTypes,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType,
} from "../controllers/businessTypeController.js";
import ROLES from "../utils/constants/roles.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { verifySession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/business-types
 * @desc    Get all business types
 */
router.get("/", verifySession, getAllBusinessTypes);

/**
 * @route   POST /api/business-types
 * @desc    Create a new business type
 * @access  Super Admin only
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  createBusinessType
);

/**
 * @route   PUT /api/business-types/:id
 * @desc    Update a business type by ID
 * @access  Super Admin only
 */
router.put(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  updateBusinessType
);

/**
 * @route   DELETE /api/business-types/:id
 * @desc    Soft delete a business type by ID
 * @access  Super Admin only
 */
router.delete(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteBusinessType
);

export default router;
