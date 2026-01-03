import api from "../api/axios";
import { KYC_API } from "./api";

/**
 * Get KYC requirements for current user
 */
export const getKYCRequirements = async () => {
  const response = await api.get(`${KYC_API}/requirements`);
  return response.data;
};

/**
 * Get KYC profile and role-specific profile
 *
 * @returns {{
 *   kycProfile: Object,
 *   roleProfile: Object | null
 * }}
 */
export const getKYCProfile = async () => {
  const response = await api.get(`${KYC_API}/profile`);
  return response.data; // { kycProfile, roleProfile }
};

/**
 * Upload KYC document
 * @param {File} file - The document file
 * @param {string} kycDocumentCode - Code of the KYC document
 * @param {string} validFrom - Optional start date (ISO string)
 * @param {string} validUntil - Optional end date (ISO string)
 */
export const uploadKYCDocument = async (
  file,
  kycDocumentCode,
  validFrom = null,
  validUntil = null
) => {
  // --- Safety: ensure inputs exist (won't break your existing flows) ---
  if (!file) throw new Error("File is required for KYC upload.");
  if (!kycDocumentCode) throw new Error("KYC Document Code is required.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("kycDocumentCode", kycDocumentCode);

  if (validFrom) formData.append("validFrom", validFrom);
  if (validUntil) formData.append("validUntil", validUntil);

  const response = await api.post(`${KYC_API}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Update business profile
 * @param {Object} profileData - Profile fields to update
 */
export const updateBusinessProfile = async (profileData) => {
  if (!profileData || typeof profileData !== "object") {
    throw new Error("Profile data must be a valid object.");
  }

  const response = await api.put(`${KYC_API}/profile`, profileData);
  return response.data;
};

export const getAgentProfile = () => api.get(`${KYC_API}/agent-profile`);

export const updateAgentProfile = (payload) =>
  api.put(`${KYC_API}/agent-profile`, payload);

/**
 * Submit KYC for review
 */
export const submitKYCForReview = async () => {
  const response = await api.post(`${KYC_API}/submit`);
  return response.data;
};
