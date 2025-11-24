// src/api/axios.js
import axios from "axios";

/**
 * Axios instance for all API requests.
 * - Base URL is taken from VITE_API_URL if defined, otherwise falls back to localhost.
 * - withCredentials ensures httpOnly cookie auth works.
 * - Content-Type is set to JSON by default.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor
 * - Returns the response normally on success
 * - Logs warning and optionally redirects on 401 Unauthorized
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Unauthorized — Session expired");
      // Optionally: redirect user to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
