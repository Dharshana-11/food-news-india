// src/services/complianceCategoryService.js
import axios from "axios";
import { SUPER_ADMIN_COMPLIANCE_CATEGORY_API } from "./api";

export const getAllCategories = async (limit = 0, search = "") => {
  const res = await axios.get(
    `${SUPER_ADMIN_COMPLIANCE_CATEGORY_API}?limit=${limit}&search=${search}`,
    { 
        withCredentials: true,
    },
  );
  return res.data;
};