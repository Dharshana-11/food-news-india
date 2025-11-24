// services/complianceMappingService.js
import api from "../api/axios";
import {
  COMPLIANCE_MAPPING_API,
  SUPER_ADMIN_COMPLIANCE_ITEM_API,
  BUSINESS_TYPE_API,
} from "./api";

/**
 * Fetch all compliance mappings with optional pagination and search
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} search - Search term
 * @returns {Promise<Object>} - API response containing mappings
 */
export const getAllComplianceMappings = async (
  page = 1,
  limit = 10,
  search = "",
) => {
  const params = { page, limit };
  if (search) params.search = search;

  const response = await api.get(`${COMPLIANCE_MAPPING_API}`, { params });
  return response.data;
};

/**
 * Fetch grid data for a specific business type
 * @param {string} businessTypeId
 * @returns {Promise<Object>} - API response containing grid rules
 */
export const getComplianceMappingGrid = async (businessTypeId) => {
  const response = await api.get(
    `${COMPLIANCE_MAPPING_API}/grid/${businessTypeId}`,
  );
  return response.data;
};

/**
 * Create or update a mapping
 * @param {Object} data - Mapping payload
 * @returns {Promise<Object>} - API response
 */
export const createOrUpdateMapping = async (data) => {
  const response = await api.post(`${COMPLIANCE_MAPPING_API}`, data);
  return response.data;
};

/**
 * Delete a mapping by ID
 * @param {string} id
 * @returns {Promise<Object>} - API response
 */
export const deleteMapping = async (id) => {
  const response = await api.delete(`${COMPLIANCE_MAPPING_API}/${id}`);
  return response.data;
};

/**
 * Fetch active business types for dropdown
 * @returns {Promise<Array>} - Array of business types
 */
export const getBusinessTypesForDropdown = async () => {
  const response = await api.get(`${BUSINESS_TYPE_API}`, {
    params: { status: "active", limit: 100 },
  });
  return response.data.data || [];
};

/**
 * Fetch active compliance items for dropdown
 * @returns {Promise<Array>} - Array of compliance items
 */
export const getComplianceItemsForDropdown = async () => {
  const response = await api.get(`${SUPER_ADMIN_COMPLIANCE_ITEM_API}`, {
    params: { status: "active", limit: 100 },
  });
  return response.data.data || [];
};
