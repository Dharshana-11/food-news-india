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

  // ========== SERVICE MANAGEMENT ==========

  // Services
  SERVICES_LIST: "/services",
  SERVICE_DETAIL: (id) => `/services/${id}`,
  SERVICE_CREATE: "/services",
  SERVICE_UPDATE: (id) => `/services/${id}`,
  SERVICE_DELETE: (id) => `/services/${id}`,
  SERVICE_CATEGORIES: "/services/categories",
  SERVICE_PROVIDERS: (id) => `/services/${id}/providers`,

  // Bookings
  BOOKINGS_LIST: "/bookings",
  BOOKING_CREATE: "/bookings",
  BOOKING_DETAIL: (id) => `/bookings/${id}`,
  BOOKING_STATS: "/bookings/stats",
  BOOKING_UPDATE_STATUS: (id) => `/bookings/${id}/status`,
  BOOKING_CANCEL: (id) => `/bookings/${id}/cancel`,
  BOOKING_RATE: (id) => `/bookings/${id}/rating`,

  //Compliance Score
  MY_COMPLIANCE_SCORE: "/compliance-score/me",

  // ========== AGENT INVITES ==========
  AGENT_INVITES: "/agent-invites",
  AGENT_INVITE_ACCEPT: (relationId) => `/agent-invites/${relationId}/accept`,
  AGENT_INVITE_REJECT: (relationId) => `/agent-invites/${relationId}/reject`,
};
