// services/documentService.js
import api from "../api/axios";
import { DOCUMENT_API } from "./api";

export const getAllDocuments = async (page = 1, limit = 10, search = "", status = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await api.get(`${DOCUMENT_API}`, { params });
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await api.get(`${DOCUMENT_API}${id}`);
  return response.data;
};

export const createDocument = async (formData) => {
  const response = await api.post(`${DOCUMENT_API}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateDocument = async (id, formData) => {
  const response = await api.put(`${DOCUMENT_API}${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const reviewDocument = async (id, reviewData) => {
  const response = await api.patch(`${DOCUMENT_API}${id}/review`, reviewData);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`${DOCUMENT_API}${id}`);
  return response.data;
};

// Helper: Get users for dropdown (you may need to create this endpoint)
export const getUsersForDropdown = async () => {
  const response = await api.get("/admin/users", { params: { limit: 100 } });
  return response.data.data;
};