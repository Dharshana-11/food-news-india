// src/services/complianceItemService.js
import api from "../api/axios";
import { SUPER_ADMIN_COMPLIANCE_ITEM_API } from "../services/api.js";

/**
 * Fetch all compliance items from the backend.
 * Supports optional limit and search term.
 * TODO: Extend with pagination, filters, and sorting in future.
 *
 * @param {number} limit - Number of items to fetch (0 = no limit)
 * @param {string} search - Search term to filter by item name
 * @returns {Promise<Array>} Array of compliance items
 */
export const getAllComplianceItems = async (limit = 0, search = "") => {
  try {
    const res = await api.get(SUPER_ADMIN_COMPLIANCE_ITEM_API, {
      params: { limit, search },
    });
    return res.data?.data || []; // Return only the items array
  } catch (err) {
    console.error("Error fetching compliance items:", err);
    throw err;
  }
};

/**
 * Add a new compliance item
 *
 * @param {Object} payload - Item details (name, code, description, status, etc.)
 * @returns {Promise<Object>} Added item response from backend
 */
export const addComplianceItem = async (payload) => {
  try {
    const res = await api.post(SUPER_ADMIN_COMPLIANCE_ITEM_API, payload);
    return res.data;
  } catch (err) {
    console.error("Error adding compliance item:", err);
    throw err;
  }
};

/**
 * Update an existing compliance item
 *
 * @param {string} id - Compliance item ID
 * @param {Object} payload - Fields to update
 * @returns {Promise<Object>} Updated item response from backend
 */
export const updateComplianceItem = async (id, payload) => {
  try {
    const res = await api.put(
      `${SUPER_ADMIN_COMPLIANCE_ITEM_API}/${id}`,
      payload
    );
    return res.data;
  } catch (err) {
    console.error(`Error updating compliance item (ID: ${id}):`, err);
    throw err;
  }
};

/**
 * Soft delete a compliance item (sets status = 'trash')
 *
 * @param {string} id - Compliance item ID
 * @returns {Promise<Object>} Response from backend
 */
export const deleteComplianceItem = async (id) => {
  try {
    const res = await api.delete(`${SUPER_ADMIN_COMPLIANCE_ITEM_API}/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting compliance item (ID: ${id}):`, err);
    throw err;
  }
};
