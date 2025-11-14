import express from "express";
import {
  createKycDocument,
  getKycDocuments,
  getKycDocumentById,
  updateKycDocument,
  updateKycDocumentStatus,
  deleteKycDocument,
} from "../controllers/KYCDocumentController.js";

import { verifySession } from "../middleware/sessionMiddleware.js"; 
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

// Create
router.post("/", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), createKycDocument);

// List (pagination + search + status)
router.get("/", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), getKycDocuments);

// Get by ID
router.get("/:id", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), getKycDocumentById);

// Update full document
router.put("/:id", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateKycDocument);

// Update only status
router.patch("/:id/status", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateKycDocumentStatus);

// Soft delete → move to trash
router.delete("/:id", verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteKycDocument);

export default router;
