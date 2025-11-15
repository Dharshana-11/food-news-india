// services/kycDocumentService.js
import api from "../api/axios";
import { KYC_DOCUMENT_API } from "./api";

export const getAllKYCDocuments = async (page = 1, limit = 10, search = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await api.get(`${KYC_DOCUMENT_API}`, { params });
  return response.data;
};

export const getKYCDocumentById = async (id) => {
  const response = await api.get(`${KYC_DOCUMENT_API}${id}`);
  return response.data;
};

export const createKYCDocument = async (data) => {
  const response = await api.post(`${KYC_DOCUMENT_API}`, data);
  return response.data;
};

export const updateKYCDocument = async (id, data) => {
  const response = await api.put(`${KYC_DOCUMENT_API}${id}`, data);
  return response.data;
};

export const deleteKYCDocument = async (id) => {
  const response = await api.delete(`${KYC_DOCUMENT_API}${id}`);
  return response.data;
};

// Helper to fetch KYC documents for dropdown
export const getKYCDocumentsForDropdown = async () => {
  const response = await api.get(`${KYC_DOCUMENT_API}`, { params: { status: "active", limit: 100 } });
  return response.data.data;
};