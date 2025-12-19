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

  AGENTS_AVAILABLE: "/agents/available",
  AGENTS_MY: "/agents/my-agents",
  AGENT_DETAILS: (id) => `/agents/${id}`,
  AGENT_INVITE: "/agents/invite",
  AGENT_PERMISSIONS: (id) => `/agents/${id}/permissions`,
  AGENT_REMOVE: (id) => `/agents/${id}`,
};
