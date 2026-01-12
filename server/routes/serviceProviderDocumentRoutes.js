import express from "express";
import { createDocument } from "../controllers/documentController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * Service Provider uploads authorization documents
 * POST /api/service-provider/documents
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  upload.single("file"),
  createDocument
);

export default router;
