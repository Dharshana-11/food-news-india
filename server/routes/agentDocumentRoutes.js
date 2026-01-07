/**
 * agentDocumentRoutes.js
 * ============================================================================
 * Routes for agent document management
 */

import express from "express";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import ROLES from "../utils/constants/roles.js";

import {
  getAgentDocumentOverview,
  getBusinessDocuments,
  uploadDocumentForBusiness,
  getDocumentCategories,
  deleteAgentDocument,
  renameAgentDocument,
} from "../controllers/agentDocumentController.js";

const router = express.Router();

// All routes require authentication + agent role
router.use(verifySession);
router.use(authorizeRoles(ROLES.AGENT));

/**
 * @route GET /api/agent/documents
 * @description Get document overview for all assigned businesses
 * @access Agent only
 */
router.get("/", getAgentDocumentOverview);

/**
 * @route GET /api/agent/documents/business/:relationId
 * @description Get documents for a specific business
 * @param {string} relationId - BusinessAgentRelation ID
 * @query {string} category - Filter by category (kyc/compliance)
 * @query {string} status - Filter by status
 * @query {string} search - Search term
 * @query {string} expiry - Filter by expiry (expiring_soon/expired)
 * @access Agent only
 */
router.get("/business/:relationId", getBusinessDocuments);

/**
 * @route POST /api/agent/documents/upload
 * @description Upload document for a business
 * @body {string} relationId - BusinessAgentRelation ID
 * @body {string} categoryType - kyc or compliance
 * @body {string} categoryId - KYCDocument or ComplianceItem ID
 * @body {string} validFrom - Start date (optional)
 * @body {string} validUntil - End date (optional)
 * @access Agent only (requires canUploadDocuments permission)
 */
router.post("/upload", upload.single("file"), uploadDocumentForBusiness);

/**
 * @route GET /api/agent/documents/categories
 * @description Get available document categories
 * @query {string} relationId - BusinessAgentRelation ID
 * @access Agent only
 */
router.get("/categories", getDocumentCategories);

/**
 * DELETE /api/agent/documents/:documentId
 */
router.delete("/:documentId", deleteAgentDocument);

/**
 * PATCH /api/agent/documents/:documentId/rename
 */
router.patch("/:documentId/rename", renameAgentDocument);

export default router;
