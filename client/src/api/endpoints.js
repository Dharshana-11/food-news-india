/**
 * endpoints.js
 * ============================================================================
 * Centralized API endpoint constants for FoodNewsIndia
 */

export const ENDPOINTS = {
  // Authentication
  VERIFY_USER: "/api/auth/verify",
  COMPLETE_PROFILE: "/api/auth/complete-profile",

  // Session Management
  CREATE_SESSION: "/api/session",
  VERIFY_SESSION: "/api/session/verify-session",
  REFRESH_SESSION: "/api/session/refresh-session",
  LOGOUT: "/api/session/logout",

  // User Management (Admin)
  USERS_LIST: "/api/users",
  USER_DETAIL: (uid) => `/api/users/${uid}`,
  USER_UPDATE: (uid) => `/api/users/${uid}`,
  USER_DELETE: (uid) => `/api/users/${uid}`,
};
