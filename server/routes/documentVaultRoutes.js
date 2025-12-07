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

// Apply session verification and business owner role check
router.use(verifySession, authorizeRoles(ROLES.BUSINESS_OWNER));

/**
 * @route GET /api/business-owner/documents/stats
 * @description Get document statistics for current business owner
 * @access Business Owner
 */
router.get("/stats", getMyDocumentStats);

/**
 * @route GET /api/business-owner/documents/categories
 * @description Get available document categories (KYC & Compliance items)
 * @access Business Owner
 */
router.get("/categories", getDocumentCategories);

/**
 * @route GET /api/business-owner/documents
 * @description Get all documents for current business owner
 * @access Business Owner
 */
router.get("/", getMyDocuments);

/**
 * @route POST /api/business-owner/documents
 * @description Upload a new document
 * @access Business Owner
 */
router.post("/", upload.single("file"), uploadMyDocument);

/**
 * @route PATCH /api/business-owner/documents/:id/rename
 * @description Rename a document
 * @access Business Owner
 */
router.patch("/:id/rename", renameMyDocument);

/**
 * @route DELETE /api/business-owner/documents/:id
 * @description Delete a document (soft delete)
 * @access Business Owner
 */
router.delete("/:id", deleteMyDocument);

export default router;

// ADD THIS TO YOUR server.js:
// import documentVaultRoutes from "./routes/documentVaultRoutes.js";
// app.use("/api/business-owner/documents", documentVaultRoutes);
