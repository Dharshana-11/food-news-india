import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Get KYC requirements for current user
 */
export const getKYCRequirements = async () => {
  const response = await axios.get(`${API_BASE_URL}/kyc/requirements`);
  return response.data;
};

/**
 * Get user's business profile
 */
export const getKYCProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/kyc/profile`);
  return response.data;
};

/**
 * Upload KYC document
 * @param {File} file - The document file
 * @param {string} kycDocumentCode - Code of the KYC document
 * @param {string} validFrom - Optional start date (ISO string)
 * @param {string} validUntil - Optional end date (ISO string)
 */
export const uploadKYCDocument = async (file, kycDocumentCode, validFrom = null, validUntil = null) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kycDocumentCode", kycDocumentCode);
  
  if (validFrom) {
    formData.append("validFrom", validFrom);
  }
  
  if (validUntil) {
    formData.append("validUntil", validUntil);
  }

  const response = await axios.post(`${API_BASE_URL}/kyc/upload`, formData, {
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
  const response = await axios.put(`${API_BASE_URL}/kyc/profile`, profileData);
  return response.data;
};

/**
 * Submit KYC for review
 */
export const submitKYCForReview = async () => {
  const response = await axios.post(`${API_BASE_URL}/kyc/submit`);
  return response.data;
};