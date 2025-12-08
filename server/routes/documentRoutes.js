import express from "express";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  reviewDocument,
} from "../controllers/documentController.js";

import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * MIDDLEWARE:
 * - Verify session
 * - Allow only ADMIN / SUPER_ADMIN
 */
router.use(verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

/**
 * @route POST /documents
 * @description Create a new Document (KYC/Compliance). File upload supported.
 * @access Admin, Super Admin
 */
router.post("/", createDocument);

/**
 * @route GET /documents
 * @description Get all documents (pagination, filters: status, user, type, etc.)
 * @access Admin, Super Admin
 */
router.get("/", getAllDocuments);

/**
 * @route GET /documents/:id
 * @description Get a single document by its ID
 * @access Admin, Super Admin
 */
router.get("/:id", getDocumentById);

/**
 * @route PUT /documents/:id
 * @description Update document metadata (dates, user, file upload)
 * @access Admin, Super Admin
 */
router.put("/:id", upload.single("file"), updateDocument);

/**
 * @route PATCH /documents/:id/review
 * @description Review document (approve / reject / expire)
 * @access Admin, Super Admin
 */
router.patch("/:id/review", reviewDocument);

/**
 * @route DELETE /documents/:id
 * @description Soft delete → move document to trash
 * @access Admin, Super Admin
 */
router.delete("/:id", deleteDocument);

export default router;
