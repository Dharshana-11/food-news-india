import express from "express";
import { verifySession } from "../../middleware/sessionMiddleware.js";
import {
  getAllComplianceItems,
  addComplianceItem,
  updateComplianceItem,
  deleteComplianceItem
} from "../../controllers/complianceItemController.js";
import { authorizeRoles } from "../../middleware/authorizeRolesMiddleware.js";
import ROLES from "../../utils/constants/roles.js";

const router = express.Router();

// GET all categories
router.get("/", verifySession, authorizeRoles(ROLES.SUPER_ADMIN,ROLES.ADMIN), getAllComplianceItems);

// POST add new item
router.post("/", verifySession, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), addComplianceItem);

// PUT update item by ID
router.put("/:id", verifySession, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateComplianceItem);

// DELETE remove item by ID
router.delete("/:id", verifySession, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteComplianceItem);

export default router;
