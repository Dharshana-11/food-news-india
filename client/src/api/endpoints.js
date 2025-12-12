/**
 * endpoints.js
 * ============================================================================
 * Centralized API endpoint constants for FoodNewsIndia
 */

export const ENDPOINTS = {
  // Authentication
  VERIFY_USER: "auth/verify",
  COMPLETE_PROFILE: "auth/complete-profile",

  // Session Management
  CREATE_SESSION: "session",
  VERIFY_SESSION: "session/verify-session",
  REFRESH_SESSION: "session/refresh-session",
  LOGOUT: "session/logout",

  // User Management (Admin)
  USERS_LIST: "/users",
  USER_DETAIL: (uid) => `/users/${uid}`,
  USER_UPDATE: (uid) => `/users/${uid}`,
  USER_DELETE: (uid) => `/users/${uid}`,
};
