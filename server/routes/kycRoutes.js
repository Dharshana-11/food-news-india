import express from "express";
import {
  getKYCRequirements,
  getKYCProfile,
  uploadKYCDocument,
  updateBusinessProfile,
  submitKYCForReview,
} from "../controllers/kycController.js";
import upload from "../middleware/uploadMiddleware.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import {
  updateAgentProfile,
  getAgentProfile,
  getServiceProviderProfile,
  updateServiceProviderProfile,
} from "../controllers/kycController.js";

const router = express.Router();

// All routes require authentication
router.use(verifySession);

/**
 * GET /api/kyc/requirements
 * Get list of KYC documents required for user's role
 */
router.get("/requirements", getKYCRequirements);

/**
 * GET /api/kyc/profile
 * Get user's business profile and KYC status
 */
router.get("/profile", getKYCProfile);

/**
 * POST /api/kyc/upload
 * Upload a KYC document
 * Multipart form-data:
 *   - file: the document file
 *   - kycDocumentCode: code of the KYC document (e.g., "AADHAAR_FRONT")
 *   - validFrom: (optional) start date
 *   - validUntil: (optional) end date
 */
router.post("/upload", upload.single("file"), uploadKYCDocument);

/**
 * PUT /api/kyc/profile
 * Update business profile details
 */
router.put("/profile", updateBusinessProfile);

/**
 * POST /api/kyc/submit
 * Submit KYC for admin review
 */
router.post("/submit", submitKYCForReview);

/**
 * GET /api/kyc/agent-profile
 * Get agent profile
 */
router.get("/agent-profile", getAgentProfile);

/**
 * PUT /api/kyc/agent-profile
 * Update agent profile
 */
router.put("/agent-profile", updateAgentProfile);

/**
 * GET /api/kyc/service-provider-profile
 * Get service provider profile
 */
router.get("/service-provider-profile", getServiceProviderProfile);

/**
 * PUT /api/kyc/service-provider-profile
 * Update service provider profile
 */
router.put("/service-provider-profile", updateServiceProviderProfile);

export default router;
