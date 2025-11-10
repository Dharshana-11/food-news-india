import express from "express";
import { verifySession } from "../../middleware/sessionMiddleware.js";
import { authorizeAdminOrSuperAdmin } from "../../middleware/authorizeRoles.js";
import {
  getAllComplianceItems,
  addComplianceItem,
  updateComplianceItem,
  deleteComplianceItem
} from "../../controllers/complianceItemController.js";

const router = express.Router();

// GET all categories
router.get("/", verifySession, authorizeAdminOrSuperAdmin, getAllComplianceItems);

// POST add new item
router.post("/", verifySession, authorizeAdminOrSuperAdmin, addComplianceItem);

// PUT update item by ID
router.put("/:id", verifySession, authorizeAdminOrSuperAdmin, updateComplianceItem);

// DELETE remove item by ID
router.delete("/:id", verifySession, authorizeAdminOrSuperAdmin, deleteComplianceItem);

export default router;
