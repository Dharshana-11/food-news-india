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

// Apply session + role check once for all routes
router.use(verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

/**
 * @route POST /api/kyc-documents
 * @summary Create a new KYC Document
 * @tags KYC Documents
 * @param {string} body.name.required - Document name
 * @param {string} body.code.required - Unique code (uppercase)
 * @param {string} body.description - Description of the KYC
 * @param {Array<string>} body.applicableRoles.required - Roles this KYC applies to
 * @param {"active"|"inactive"} body.status - Default = active
 * @returns {object} 201 - Created document
 * @returns {Error} 400 - Validation error
 */
router.post("/", createKycDocument);

/**
 * @route GET /api/kyc-documents
 * @summary Get all KYC documents with pagination & search
 * @tags KYC Documents
 * @param {number} query.page - Page number
 * @param {number} query.limit - Items per page
 * @param {string} query.search - Search by name/code
 * @param {"active"|"inactive"} query.status - Filter by status
 * @returns {object} 200 - List of KYC documents
 */
router.get("/", getKycDocuments);

/**
 * @route GET /api/kyc-documents/{id}
 * @summary Get single KYC document by ID
 * @tags KYC Documents
 * @param {string} path.id.required - MongoDB document ID
 * @returns {object} 200 - The KYC document
 * @returns {Error} 404 - Not found
 */
router.get("/:id", getKycDocumentById);

/**
 * @route PUT /api/kyc-documents/{id}
 * @summary Update an existing KYC Document
 * @tags KYC Documents
 * @param {string} path.id.required
 * @param {string} body.name
 * @param {string} body.code
 * @param {string} body.description
 * @param {Array<string>} body.applicableRoles
 * @param {"active"|"inactive"} body.status
 * @returns {object} 200 - Updated document
 */
router.put("/:id", updateKycDocument);

/**
 * @route PATCH /api/kyc-documents/{id}/status
 * @summary Update only the status of the document
 * @tags KYC Documents
 * @param {string} path.id.required
 * @param {"active"|"inactive"|"trash"} body.status.required
 * @returns {object} 200 - Status updated
 */
router.patch("/:id/status", updateKycDocumentStatus);

/**
 * @route DELETE /api/kyc-documents/{id}
 * @summary Soft delete (move to trash)
 * @tags KYC Documents
 * @param {string} path.id.required
 * @returns {object} 200 - Document moved to trash
 */
router.delete("/:id", deleteKycDocument);

export default router;
