/**
 * @file routes.js
 * @description Centralized route configuration for the application.
 * @module routes
 *
 * @example
 * import { ROUTES } from "./routes";
 * navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
 */

export const ROUTES = {
  /* =========================================================
     PUBLIC ROUTES
  ========================================================= */
  LANDING_PAGE: "/",
  LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",

  /* =========================================================
     ADMIN ROUTES (Reserved)
  ========================================================= */
  ADMIN_DASHBOARD: "/admin/dashboard",

  /* =========================================================
     SUPER ADMIN MAIN MODULES (Top-Level Menu)
  ========================================================= */
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users", // Parent (redirects)
  SUPER_ADMIN_COMPLIANCE: "/super-admin/compliance",
  SUPER_ADMIN_SERVICES: "/super-admin/services",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
  SUPER_ADMIN_CONTENT: "/super-admin/content",
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  SUPER_ADMIN_PROFILE: "/super-admin/profile",
  SUPER_ADMIN_NOTIFICATIONS: "/super-admin/notifications", // Parent (redirects)
  SUPER_ADMIN_TICKETS: "/super-admin/tickets", // Parent (redirects)

  /* =========================================================
     USERS MODULE (Subpages)
  ========================================================= */
  USER_LIST: "/super-admin/users/list",
  USER_PROFILE: "/super-admin/profile/",
  USER_INVITE: "/super-admin/users/invite",
  USER_ROLES: "/super-admin/users/roles",

  /* =========================================================
     TICKETS MODULE (Subpages)
  ========================================================= */
  TICKET_BOARD: "/super-admin/tickets/board",
  TICKET_LIST: "/super-admin/tickets/list",
  TICKET_DETAILS: "/tickets/:id",

  /* =========================================================
     NOTIFICATION MODULE (Subpages)
  ========================================================= */
  NOTIF_OVERVIEW: "/super-admin/notifications/overview",
  NOTIF_MODULE_SETTINGS: "/super-admin/notifications/module",
  NOTIF_ROLE_SETTINGS: "/super-admin/notifications/roles",
  NOTIF_TEMPLATE_SETTINGS: "/super-admin/notifications/templates",
  NOTIF_GLOBAL_SETTINGS: "/super-admin/notifications/global",
  NOTIF_LOGS: "/super-admin/notifications/logs",

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
  AGENT_MY_BUSINESSES: "/agent/my-businesses",
  AGENT_BUSINESS_WORKSPACE: "/agent/my-businesses/:relationId",
  AGENT_DOCUMENT_VAULT: "/agent/documents",
  AGENT_BUSINESS_DOCUMENTS: "/agent/documents/:relationId",
  AGENT_MY_REQUESTS: "/agent/my-requests",
  AGENT_SERVICES: "/agent/services",
  AGENT_MESSAGES: "/agent/messages",
  AGENT_NOTIFICATIONS: "/agent/notifications",
  AGENT_PROFILE: "/agent/profile/",
  AGENT_PAYMENTS: "/agent/payments",
  AGENT_HELP_SUPPORT: "/agent/help",

  /* =========================================================
     SERVICE PROVIDER ROUTES
  ========================================================= */
  SERVICE_PROVIDER_DASHBOARD: "/service-provider/dashboard",
  SERVICE_PROVIDER_KYC: "/service-provider/kyc-verification",

  /* =========================================================
   BUSINESS OWNER – AGENTS
========================================================= */
  BUSINESS_OWNER_MY_AGENTS: "/business-owner/agents",
  BUSINESS_OWNER_AGENT_DETAILS: "/business-owner/agents/:relationId",
  BUSINESS_OWNER_ADD_AGENT: "/business-owner/add-agent",

  // Business Owner – Services
  BUSINESS_OWNER_SERVICES: "/business-owner/services",
  BUSINESS_OWNER_BOOK_SERVICES: "/business-owner/services/book",
  BUSINESS_OWNER_SERVICE_PROVIDERS: "/business-owner/services/book/:serviceId",
  BUSINESS_OWNER_PROVIDER_DETAILS:
    "/business-owner/services/book/:serviceId/:providerId",
  BUSINESS_OWNER_MY_BOOKINGS: "/business-owner/services/bookings",
  BUSINESS_OWNER_SERVICE_DETAILS: "/business-owner/services/:bookingId",
};
