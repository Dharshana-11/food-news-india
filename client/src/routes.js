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

  /* =========================================================
     BUSINESS OWNER ROUTES
     ========================================================= */
  BUSINESS_OWNER_DASHBOARD: "/business-owner/dashboard",
  BUSINESS_OWNER_KYC: "/business-owner/kyc-verification",
  BUSINESS_OWNER_MY_SERVICES: "/business-owner/services",
  BUSINESS_OWNER_MY_AGENTS: "/business-owner/agents",
  BUSINESS_OWNER_DOCUMENT_VAULT: "/business-owner/documents",
  BUSINESS_OWNER_COMPLIANCE_CALENDAR: "/business-owner/calendar",
  BUSINESS_OWNER_TRAINING: "/business-owner/training",
  BUSINESS_OWNER_CHECKLIST: "/business-owner/checklist",
  BUSINESS_OWNER_MESSAGES: "/business-owner/messages",
  BUSINESS_OWNER_MY_NOTIFICATIONS: "/business-owner/notifications",
  BUSINESS_OWNER_HELP_SUPPORT: "/business-owner/support",

  /* =========================================================
     AGENT ROUTES
     ========================================================= */
  AGENT_DASHBOARD: "/agent/dashboard",
  AGENT_KYC: "/agent/kyc-verification",

  /* =========================================================
     SERVICE PROVIDER ROUTES
     ========================================================= */
  SERVICE_PROVIDER_DASHBOARD: "/service-provider/dashboard",
  SERVICE_PROVIDER_KYC: "/service-provider/kyc-verification",
};
