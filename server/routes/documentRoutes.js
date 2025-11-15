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
 * CREATE Document (KYC or Compliance)
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  upload.single("file"),
  createDocument
);

/**
 * LIST ALL Documents (pagination + filters)
 */
router.get(
  "/",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getAllDocuments
);

/**
 * GET Single Document
 */
router.get(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getDocumentById
);

/**
 * UPDATE Document Metadata (validFrom, validUntil)
 */
router.put(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  upload.single("file"),
  updateDocument
);

/**
 * REVIEW Document (approve / reject / expire)
 */
router.patch(
  "/:id/review",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  reviewDocument
);

/**
 * SOFT DELETE → move to trash
 */
router.delete(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  deleteDocument
);

export default router;
