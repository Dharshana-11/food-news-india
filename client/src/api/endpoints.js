// src/api/endpoints.js

export const ENDPOINTS = {
  /* ================================
   * AUTH / SESSION
   * ================================ */

  // Create backend session after Firebase login
  CREATE_SESSION: "/session",

  // Verify active session
  VERIFY_SESSION: "/session/verify-session",

  // Refresh (rotate) session & refresh tokens
  REFRESH_SESSION: "/session/refresh-session",

  // Logout (invalidate session & cookies)
  LOGOUT: "/session/logout",

  TICKETS: "/tickets",
};
