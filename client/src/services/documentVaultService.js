// services/documentVaultService.js
import api from "../api/axios";

const DOCUMENT_VAULT_API = "/business-owner/documents";

/**
 * Internal helper to safely handle API calls.
 * Ensures consistent error messages and avoids repeated try/catch.
 *
 * @template T
 * @param {() => Promise<{ data: T }>} fn
 * @returns {Promise<T>}
 */
const safeApiCall = async (fn) => {
  try {
    const res = await fn();
    return res.data;
  } catch (error) {
    console.error("DocumentVaultService Error:", error);
    throw error?.response?.data || error;
  }
};

/**
 * Get all documents for the current business owner
 * @param {Object} filters
 * @param {string} [filters.category]
 * @param {string} [filters.status]
 * @param {string} [filters.search]
 * @param {string} [filters.expiry]
 * @returns {Promise<Object>}
 */
export const getMyDocuments = async (filters = {}) => {
  const params = {};

  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  if (filters.expiry) params.expiry = filters.expiry;

  return safeApiCall(() => api.get(DOCUMENT_VAULT_API, { params }));
};

/**
 * Upload a new document
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadDocument = async (formData) => {
  return safeApiCall(() =>
    api.post(DOCUMENT_VAULT_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

/**
 * Rename a document
 * @param {string} documentId
 * @param {string} newFileName
 * @returns {Promise<Object>}
 */
export const renameDocument = async (documentId, newFileName) => {
  return safeApiCall(() =>
    api.patch(`${DOCUMENT_VAULT_API}/${documentId}/rename`, {
      newFileName,
    })
  );
};

/**
 * Delete a document (soft delete)
 * @param {string} documentId
 * @returns {Promise<Object>}
 */
export const deleteMyDocument = async (documentId) => {
  return safeApiCall(() => api.delete(`${DOCUMENT_VAULT_API}/${documentId}`));
};

/**
 * Get direct URL to a stored document
 * @param {string} filePath
 * @returns {string}
 */
export const getDocumentUrl = (filePath) => {
  const baseURL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

  return `${baseURL}${filePath}`;
};

/**
 * Get statistics for all documents
 * @returns {Promise<Object>}
 */
export const getDocumentStats = async () => {
  return safeApiCall(() => api.get(`${DOCUMENT_VAULT_API}/stats`));
};

/**
 * Get available KYC & Compliance categories
 * @returns {Promise<Object>}
 */
export const getDocumentCategories = async () => {
  return safeApiCall(() => api.get(`${DOCUMENT_VAULT_API}/categories`));
};
