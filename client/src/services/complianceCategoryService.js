import axios from "axios";
import { SUPER_ADMIN_COMPLIANCE_CATEGORY_API } from "./api";

// Get all categories (with optional limit & search)
export const getAllCategories = async (limit = 0, search = "") => {
  const res = await axios.get(
    `${SUPER_ADMIN_COMPLIANCE_CATEGORY_API}?limit=${limit}&search=${search}`,
    { withCredentials: true }
  );
  return res.data;
};

// Add a new compliance category
export const addComplianceCategory = async (payload) => {
  const res = await axios.post(SUPER_ADMIN_COMPLIANCE_CATEGORY_API, payload, {
    withCredentials: true,
  });
  return res.data;
};

// Update an existing compliance category
export const updateComplianceCategory = async (id, payload) => {
  const res = await axios.put(
    `${SUPER_ADMIN_COMPLIANCE_CATEGORY_API}/${id}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
};

//  Delete a compliance category (soft delete)
export const deleteComplianceCategory = async (id) => {
  const res = await axios.delete(
    `${SUPER_ADMIN_COMPLIANCE_CATEGORY_API}/${id}`,
    { withCredentials: true }
  );
  return res.data;
};
