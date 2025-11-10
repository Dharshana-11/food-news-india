import axios from "axios";
import { SUPER_ADMIN_COMPLIANCE_ITEM_API } from "./api"; // renamed constant

// Get all compliance items (with optional limit & search)
export const getAllComplianceItems = async (limit = 0, search = "") => {
  const res = await axios.get(
    `${SUPER_ADMIN_COMPLIANCE_ITEM_API}?limit=${limit}&search=${search}`,
    { withCredentials: true }
  );
  return res.data.data || []; // <-- only the items array
};

// Add a new compliance item
export const addComplianceItem = async (payload) => {
  const res = await axios.post(SUPER_ADMIN_COMPLIANCE_ITEM_API, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Update an existing compliance item
export const updateComplianceItem = async (id, payload) => {
  const res = await axios.put(
    `${SUPER_ADMIN_COMPLIANCE_ITEM_API}/${id}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
};

// Delete a compliance item (soft delete)
export const deleteComplianceItem = async (id) => {
  const res = await axios.delete(
    `${SUPER_ADMIN_COMPLIANCE_ITEM_API}/${id}`,
    { withCredentials: true }
  );
  return res.data;
};
