import api from "../api/axios";
import { BUSINESS_TYPE_API } from "./api";

/**
 * Fetches all business types with optional pagination, search, and status filter.
 *
 * @param {number} page - Page number (default 1)
 * @param {number} limit - Number of items per page (default 10)
 * @param {string} search - Search text (optional)
 * @param {string} status - Status filter: "active", "inactive", or "" for all (optional)
 * @returns {Promise<Object>} - Response data from API
 */
export const getAllBusinessTypes = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;

  const response = await api.get(`${BUSINESS_TYPE_API}`, { params });
  return response.data;
};

/**
 * Fetch a single business type by ID.
 *
 * @param {string} id - Business type ID
 * @returns {Promise<Object>} - Response data from API
 */
export const getBusinessTypeById = async (id) => {
  const response = await api.get(`${BUSINESS_TYPE_API}/${id}`);
  return response.data;
};

/**
 * Create a new business type.
 *
 * @param {Object} data - Business type data
 * @returns {Promise<Object>} - Response data from API
 */
export const createBusinessType = async (data) => {
  const response = await api.post(`${BUSINESS_TYPE_API}`, data);
  return response.data;
};

/**
 * Update an existing business type.
 *
 * @param {string} id - Business type ID
 * @param {Object} data - Updated business type data
 * @returns {Promise<Object>} - Response data from API
 */
export const updateBusinessType = async (id, data) => {
  const response = await api.put(`${BUSINESS_TYPE_API}/${id}`, data);
  return response.data;
};

/**
 * Delete a business type by ID.
 *
 * @param {string} id - Business type ID
 * @returns {Promise<Object>} - Response data from API
 */
export const deleteBusinessType = async (id) => {
  const response = await api.delete(`${BUSINESS_TYPE_API}/${id}`);
  return response.data;
};
