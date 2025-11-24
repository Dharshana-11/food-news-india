// services/documentService.js
import api from "../api/axios";
import { DOCUMENT_API } from "./api";

/**
 * Fetch all documents with optional pagination, search, and status filter.
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Number of items per page
 * @param {string} [search=""] - Search text
 * @param {string} [status=""] - Filter by status (active/inactive/etc.)
 * @returns {Promise<Object>} - Response data containing documents
 */
export const getAllDocuments = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;

  const response = await api.get(`${DOCUMENT_API}`, { params });
  return response.data;
};

/**
 * Fetch a single document by its ID.
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Document data
 */
export const getDocumentById = async (id) => {
  const response = await api.get(`${DOCUMENT_API}/${id}`);
  return response.data;
};

/**
 * Create a new document.
 * @param {FormData} formData - FormData containing document info and file
 * @returns {Promise<Object>} - Created document data
 */
export const createDocument = async (formData) => {
  const response = await api.post(`${DOCUMENT_API}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Update an existing document.
 * @param {string} id - Document ID
 * @param {FormData} formData - FormData containing updated document info
 * @returns {Promise<Object>} - Updated document data
 */
export const updateDocument = async (id, formData) => {
  const response = await api.put(`${DOCUMENT_API}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Review a document (e.g., approve or reject).
 * @param {string} id - Document ID
 * @param {Object} reviewData - Data containing review status and comments
 * @returns {Promise<Object>} - Updated document data
 */
export const reviewDocument = async (id, reviewData) => {
  const response = await api.patch(`${DOCUMENT_API}/${id}/review`, reviewData);
  return response.data;
};

/**
 * Delete a document by its ID.
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Response data after deletion
 */
export const deleteDocument = async (id) => {
  const response = await api.delete(`${DOCUMENT_API}/${id}`);
  return response.data;
};

/**
 * Fetch users for a dropdown (e.g., for assigning documents to users)
 * @returns {Promise<Array>} - Array of user objects
 */
export const getUsersForDropdown = async () => {
  const response = await api.get("/admin/users", { params: { limit: 100 } });
  return response.data.data;
};
