// services/complianceMappingService.js
import api from "../api/axios";
import { COMPLIANCE_MAPPING_API, SUPER_ADMIN_COMPLIANCE_ITEM_API } from "./api";
import { BUSINESS_TYPE_API } from "./api";

export const getAllComplianceMappings = async (page = 1, limit = 10, search = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await api.get(`${COMPLIANCE_MAPPING_API}`, { params });
  return response.data;
};

export const getComplianceMappingGrid = async (businessTypeId) => {
  const response = await api.get(`${COMPLIANCE_MAPPING_API}/grid/${businessTypeId}`);
  return response.data;
};

export const createOrUpdateMapping = async (data) => {
  const response = await api.post(`${COMPLIANCE_MAPPING_API}`, data);
  return response.data;
};

export const deleteMapping = async (id) => {
  const response = await api.delete(`${COMPLIANCE_MAPPING_API}/${id}`);
  return response.data;
};

// Helper to fetch business types for dropdown
export const getBusinessTypesForDropdown = async () => {
  const response = await api.get(`${BUSINESS_TYPE_API}`, { params: { status: "active", limit: 100 } });
  return response.data.data;
};

// Helper to fetch compliance items for dropdown
export const getComplianceItemsForDropdown = async () => {
  const response = await api.get(`${SUPER_ADMIN_COMPLIANCE_ITEM_API}`, { params: { status: "active", limit: 100 } });
  return response.data.data;
};