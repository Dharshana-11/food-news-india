// services/documentVaultService.js
import api from "../api/axios";
import { DOCUMENT_VAULT_API } from "./api";
/**
 * Get all documents for the current business owner
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>}
 */
export const getMyDocuments = async (filters = {}) => {
  const { category, status, search, expiry } = filters;
  const params = {};

  if (category) params.category = category;
  if (status) params.status = status;
  if (search) params.search = search;
  if (expiry) params.expiry = expiry;

  const response = await api.get(DOCUMENT_VAULT_API, { params });
  return response.data;
};

/**
 * Upload a new document
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadDocument = async (formData) => {
  const response = await api.post(DOCUMENT_VAULT_API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Delete a document
 * @param {string} documentId
 * @returns {Promise<Object>}
 */
export const deleteMyDocument = async (documentId) => {
  const response = await api.delete(`${DOCUMENT_VAULT_API}/${documentId}`);
  return response.data;
};

/**
 * Download/View document
 * @param {string} filePath
 * @returns {string} Full URL to document
 */
export const getDocumentUrl = (filePath) => {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseURL}${filePath}`;
};

/**
 * Get document statistics
 * @returns {Promise<Object>}
 */
export const getDocumentStats = async () => {
  const response = await api.get(`${DOCUMENT_VAULT_API}/stats`);
  return response.data;
};

/**
 * Get available document categories
 * @returns {Promise<Array>}
 */
export const getDocumentCategories = async () => {
  const response = await api.get(`${DOCUMENT_VAULT_API}/categories`);
  return response.data;
};
