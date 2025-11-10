/**
 * routes.js
 * ------------------------------------------------------------
 * Centralized route path definitions for the entire application.
 *
 * Using constants ensures:
 * - No hardcoded paths scattered across components.
 * - Easier maintenance when URLs change.
 * - Better readability and consistency for navigation and redirects.
 * ------------------------------------------------------------
 */

/**
 * @constant {Object} ROUTES
 * @description Defines all public and protected route paths used in the app.
 *
 * Grouped by user roles:
 * - Public routes are accessible without authentication.
 * - Super Admin routes are protected and require the SUPER_ADMIN role.
 * - Admin routes (future expansion) are protected and require the ADMIN role.
 */
export const ROUTES = {
  /* =========================================================
     PUBLIC ROUTES
     ========================================================= */
  LANDING_PAGE: "/",
  LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",

  /* =========================================================
     ADMIN ROUTES (Reserved for future use)
     ========================================================= */
  ADMIN_DASHBOARD: "/admin/dashboard",

  /* =========================================================
     SUPER ADMIN PROTECTED ROUTES
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

  SUPER_ADMIN_COMPLIANCE_ITEMS: "/super-admin/compliance-items",
};
