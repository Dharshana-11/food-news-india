// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // <-- VERY IMPORTANT for httpOnly cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: If backend sends 401, force logout or redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Unauthorized — Session expired");
      // window.location.href = "/login"; // uncomment if needed
    }
    return Promise.reject(error);
  }
);

export default api;
