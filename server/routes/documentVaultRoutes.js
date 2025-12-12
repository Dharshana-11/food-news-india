// routes/documentVaultRoutes.js
import express from "express";
import {
  getMyDocuments,
  uploadMyDocument,
  deleteMyDocument,
  getMyDocumentStats,
  renameMyDocument,
  getDocumentCategories,
} from "../controllers/documentVaultController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * Global middleware:
 * Ensures:
 *  - Valid session
 *  - User has BUSINESS_OWNER role
 */
router.use(verifySession, authorizeRoles(ROLES.BUSINESS_OWNER));

/**
 * @route GET /api/business-owner/documents/stats
 * @desc Get document statistics for the logged-in business owner
 * @access Private (Business Owner)
 */
router.get("/stats", getMyDocumentStats);

/**
 * @route GET /api/business-owner/documents/categories
 * @desc Get available KYC & Compliance categories
 * @access Private (Business Owner)
 */
router.get("/categories", getDocumentCategories);

/**
 * @route GET /api/business-owner/documents
 * @desc Get all documents for the logged-in business owner
 * @access Private (Business Owner)
 */
router.get("/", getMyDocuments);

/**
 * @route POST /api/business-owner/documents
 * @desc Upload a new document
 * @access Private (Business Owner)
 */
router.post("/", upload.single("file"), uploadMyDocument);

/**
 * @route PATCH /api/business-owner/documents/:id/rename
 * @desc Rename a document belonging to the current user
 * @access Private (Business Owner)
 */
router.patch("/:id/rename", renameMyDocument);

/**
 * @route DELETE /api/business-owner/documents/:id
 * @desc Soft delete a document
 * @access Private (Business Owner)
 */
router.delete("/:id", deleteMyDocument);

export default router;
