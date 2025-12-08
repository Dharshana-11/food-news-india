/**
 * Base URL for all API calls.
 * Uses VITE_API_URL if available; otherwise defaults to localhost.
 */
const envBase = import.meta.env.VITE_API_URL;

export const BASE_URL = envBase
  ? `${envBase}/api`
  : "http://localhost:5000/api";

/**
 * Super Admin API Endpoints
 * (Used across compliance, business types, mappings, KYC, and documents)
 */

// Compliance Item CRUD
export const SUPER_ADMIN_COMPLIANCE_ITEM_API = `${BASE_URL}/compliance-items`;

// Business Types CRUD
export const BUSINESS_TYPE_API = `${BASE_URL}/business-types`;

// Compliance Requirement Mapping (Admin / Super Admin)
export const COMPLIANCE_MAPPING_API = `${BASE_URL}/admin/compliance-mappings`;

// KYC Documents CRUD
export const KYC_DOCUMENT_API = `${BASE_URL}/kyc-documents`;

// Uploaded Documents CRUD
export const DOCUMENT_API = `${BASE_URL}/documents`;

// KYC Flow (Requirements, Profile, Upload, Submit)
export const KYC_API = `${BASE_URL}/kyc`;
