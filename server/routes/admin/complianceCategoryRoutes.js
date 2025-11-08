import express from "express";
import { verifySession } from "../../middleware/sessionMiddleware.js";
import { authorizeAdminOrSuperAdmin } from "../../middleware/authAdminMiddleware.js";
import {
  getAllComplianceCategories,
  addComplianceCategory,
  updateComplianceCategory,
  deleteComplianceCategory
} from "../../controllers/complianceCategoryController.js";

const router = express.Router();

// GET all categories
router.get("/", verifySession, authorizeAdminOrSuperAdmin, getAllComplianceCategories);

// POST add new category
router.post("/", verifySession, authorizeAdminOrSuperAdmin, addComplianceCategory);

// PUT update category by ID
router.put("/:id", verifySession, authorizeAdminOrSuperAdmin, updateComplianceCategory);

// DELETE remove category by ID
router.delete("/:id", verifySession, authorizeAdminOrSuperAdmin, deleteComplianceCategory);

export default router;
