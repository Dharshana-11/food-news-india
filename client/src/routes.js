/**
 * routes.js
 * ------------------------------------------------------------
 * Centralized route path definitions for the application.
 *
 * Benefits:
 * - Prevents hardcoded URLs across components.
 * - Simplifies maintenance when route paths change.
 * - Enhances readability and consistency for navigation and redirects.
 * ------------------------------------------------------------
 */

/**
 * @constant {Object} ROUTES
 * @description All route paths used in the app.
 *
 * Grouped by role / access level:
 * - PUBLIC: Accessible without authentication.
 * - ADMIN: Protected (future expansion, requires ADMIN role).
 * - SUPER_ADMIN: Protected (requires SUPER_ADMIN role).
 */
export const ROUTES = {
  /* =========================================================
     PUBLIC ROUTES
     ========================================================= */
  LANDING_PAGE: "/",
  LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",

  /* =========================================================
     ADMIN ROUTES (reserved for future expansion)
     ========================================================= */
  ADMIN_DASHBOARD: "/admin/dashboard",

  /* =========================================================
     SUPER ADMIN ROUTES (protected)
     ========================================================= */
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users",
  SUPER_ADMIN_COMPLIANCE: "/super-admin/compliance-docs",
  SUPER_ADMIN_SERVICES: "/super-admin/services",
  SUPER_ADMIN_SUPPORT: "/super-admin/support",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
  SUPER_ADMIN_CONTENT: "/super-admin/content",
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  SUPER_ADMIN_PROFILE: "/super-admin/profile",
  SUPER_ADMIN_NOTIFICATIONS: "/super-admin/notifications",
  SUPER_ADMIN_TICKETS: "/super-admin/tickets",

  /* =========================================================
     SUPER ADMIN COMPLIANCE & DOCUMENT MANAGEMENT
     ========================================================= */
  SUPER_ADMIN_COMPLIANCE_ITEMS: "/super-admin/compliance-items",
  SUPER_ADMIN_BUSINESS_TYPES: "/super-admin/business-types",
  SUPER_ADMIN_COMPLIANCE_MAPPINGS: "/super-admin/compliance-mappings",
  SUPER_ADMIN_KYC_DOCUMENTS: "/super-admin/kyc-documents",
  SUPER_ADMIN_DOCUMENTS: "/super-admin/documents",
};
