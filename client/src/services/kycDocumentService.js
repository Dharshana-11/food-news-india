import api from "../api/axios";
import { KYC_DOCUMENT_API } from "./api";

/**
 * Fetches a paginated list of KYC documents.
 * @param {number} [page=1] - Page number for pagination.
 * @param {number} [limit=10] - Number of items per page.
 * @param {string} [search=""] - Optional search query.
 * @returns {Promise<Object>} Response containing data and pagination info.
 */
export const getAllKYCDocuments = async (page = 1, limit = 10, search = "") => {
  const params = { page, limit };
  if (search) params.search = search;

  const response = await api.get(`${KYC_DOCUMENT_API}`, { params });
  return response.data;
};

/**
 * Fetches a single KYC document by its ID.
 * @param {string} id - Document ID.
 * @returns {Promise<Object>} The KYC document object.
 */
export const getKYCDocumentById = async (id) => {
  const response = await api.get(`${KYC_DOCUMENT_API}/${id}`);
  return response.data;
};

/**
 * Creates a new KYC document.
 * @param {Object} data - Document data to create.
 * @returns {Promise<Object>} The created KYC document object.
 */
export const createKYCDocument = async (data) => {
  const response = await api.post(`${KYC_DOCUMENT_API}`, data);
  return response.data;
};

/**
 * Updates an existing KYC document by ID.
 * @param {string} id - Document ID.
 * @param {Object} data - Updated document data.
 * @returns {Promise<Object>} The updated KYC document object.
 */
export const updateKYCDocument = async (id, data) => {
  const response = await api.put(`${KYC_DOCUMENT_API}/${id}`, data);
  return response.data;
};

/**
 * Deletes a KYC document by ID.
 * @param {string} id - Document ID.
 * @returns {Promise<Object>} Response from delete operation.
 */
export const deleteKYCDocument = async (id) => {
  const response = await api.delete(`${KYC_DOCUMENT_API}/${id}`);
  return response.data;
};

/**
 * Fetches active KYC documents for use in dropdowns.
 * @returns {Promise<Array>} Array of active KYC documents.
 */
export const getKYCDocumentsForDropdown = async () => {
  const response = await api.get(`${KYC_DOCUMENT_API}`, {
    params: { status: "active", limit: 100 },
  });
  return response.data.data;
};
