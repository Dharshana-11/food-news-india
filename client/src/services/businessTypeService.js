// services/businessTypeService.js
import api from "../api/axios";
import { BUSINESS_TYPES_API } from "./api";

export const getAllBusinessTypes = async (page = 1, limit = 10, search = "", status = "") => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await api.get(`${BUSINESS_TYPES_API}`, { params });
  return response.data;
};

export const getBusinessTypeById = async (id) => {
  const response = await api.get(`${BUSINESS_TYPES_API}${id}`);
  return response.data;
};

export const createBusinessType = async (data) => {
  const response = await api.post(`${BUSINESS_TYPES_API}`, data);
  return response.data;
};

export const updateBusinessType = async (id, data) => {
  const response = await api.put(`${BUSINESS_TYPES_API}${id}`, data);
  return response.data;
};

export const deleteBusinessType = async (id) => {
  const response = await api.delete(`${BUSINESS_TYPES_API}${id}`);
  return response.data;
};