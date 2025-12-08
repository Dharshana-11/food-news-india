import axios from "axios";
import { ENDPOINTS } from "./endpoints";

/**
 * Axios instance for API requests with:
 * - Session cookies enabled
 * - Automatic session refresh on 401
 * - Queueing of failed requests during refresh
 * - UI hooks for refresh state
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* -------------------------------------------------------------------------- */
/*                                Refresh Logic                               */
/* -------------------------------------------------------------------------- */

/** @type {boolean} Indicates whether a refresh is currently running */
let isRefreshing = false;

/** Queue of requests waiting while refresh is happening */
let failedQueue = [];

/**
 * Resolve or reject all queued requests.
 *
 * @param {Error|null} error - Error if refresh failed, otherwise null.
 */
const processQueue = (error) => {
  failedQueue.forEach((entry) => {
    error ? entry.reject(error) : entry.resolve();
  });
  failedQueue = [];
};

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

/**
 * Optional UI hooks set by AuthContext.
 * @property {Function|null} onSessionExpired - Triggered when refresh fails.
 * @property {Function|null} onRefreshStart   - Triggered when refresh begins.
 * @property {Function|null} onRefreshEnd     - Triggered when refresh completes (success/failure).
 */
api.onSessionExpired = null;
api.onRefreshStart = null;
api.onRefreshEnd = null;

/* -------------------------------------------------------------------------- */
/*                            Response Interceptor                             */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /* ------------------------- Skip refresh for some APIs ------------------------ */

    const noRetryEndpoints = [
      ENDPOINTS.REFRESH_SESSION,
      ENDPOINTS.CREATE_SESSION,
      ENDPOINTS.LOGIN,
      ENDPOINTS.LOGOUT,
    ];

    const isNoRetry = noRetryEndpoints.some((ep) =>
      originalRequest.url?.includes(ep),
    );

    if (isNoRetry) {
      console.log("Skipping refresh for:", originalRequest.url);

      // Special case: refresh endpoint failed → session expired
      if (originalRequest.url?.includes(ENDPOINTS.REFRESH_SESSION)) {
        isRefreshing = false;
        processQueue(error);

        if (api.onRefreshEnd) api.onRefreshEnd();
        if (api.onSessionExpired) api.onSessionExpired();
      }

      return Promise.reject(error);
    }

    /* ------------------------------ Handle 401 ------------------------------ */

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("401 received on:", originalRequest.url);

      // Already refreshing → queue request
      if (isRefreshing) {
        console.log("Already refreshing — queuing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      // Start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      console.log("Starting session refresh");
      if (api.onRefreshStart) api.onRefreshStart();

      try {
        // Attempt refresh
        await api.post(ENDPOINTS.REFRESH_SESSION);

        console.log("Refresh successful — waiting for cookies to apply");
        await new Promise((resolve) => setTimeout(resolve, 500));

        processQueue(null);
        isRefreshing = false;

        console.log("Refresh done — retrying failed requests");
        if (api.onRefreshEnd) api.onRefreshEnd();

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError.response?.status);

        processQueue(refreshError);
        isRefreshing = false;

        if (api.onRefreshEnd) api.onRefreshEnd();
        if (api.onSessionExpired) api.onSessionExpired();

        return Promise.reject(refreshError);
      }
    }

    /* -------------------------- Default error return -------------------------- */

    return Promise.reject(error);
  },
);

export default api;
