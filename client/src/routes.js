/**
 * @file routes.js
 * @description Centralized route configuration for the application
 * @module routes
 * 
 * @description
 * This file contains all the route paths used throughout the application.
 * Routes are organized by feature/module for better maintainability.
 * 
 * @example
 * // Import and use routes
 * import { ROUTES } from './routes';
 * 
 * // Navigate to dashboard
 * navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
 */

export const ROUTES = {
  /* =========================================================
     PUBLIC ROUTES
     Routes accessible by all users, including unauthenticated ones
  ========================================================= */
  LANDING_PAGE: "/",
  LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",

  /* =========================================================
     ADMIN ROUTES (Reserved)
     Routes for admin users (reserved for future use)
  ========================================================= */
  ADMIN_DASHBOARD: "/admin/dashboard",

  /* =========================================================
     SUPER ADMIN MAIN MODULES (Top-Level Menu)
     Main navigation routes for super admin users
     These typically appear in the main navigation menu
  ========================================================= */
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users",           // Parent (redirects)
  SUPER_ADMIN_COMPLIANCE: "/super-admin/compliance",
  SUPER_ADMIN_SERVICES: "/super-admin/services",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
  SUPER_ADMIN_CONTENT: "/super-admin/content",
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  SUPER_ADMIN_PROFILE: "/super-admin/profile",
  SUPER_ADMIN_NOTIFICATIONS: "/super-admin/notifications",  // Parent (redirects)
  SUPER_ADMIN_TICKETS: "/super-admin/tickets",       // Parent (redirects)

  /* =========================================================
     USERS MODULE (Subpages)
     Routes for user management functionality
     @see UserManagement component
  ========================================================= */
  USER_LIST: "/super-admin/users/list",
  USER_INVITE: "/super-admin/users/invite",
  USER_ROLES: "/super-admin/users/roles",

  /* =========================================================
     TICKETS MODULE (Subpages)
     Routes for ticket management functionality
     @see TicketBoard, TicketList, TicketDetails components
  ========================================================= */
  TICKET_BOARD: "/super-admin/tickets/board",
  TICKET_LIST: "/super-admin/tickets/list",
  TICKET_DETAILS: "/tickets/:id",     // Dynamic route (Do NOT change)

  /* =========================================================
     NOTIFICATION MODULE (Subpages)
     Routes for notification management and settings
     @see NotificationOverview, ModuleSettings, RoleSettings, TemplateSettings components
  ========================================================= */
  NOTIF_OVERVIEW: "/super-admin/notifications/overview",
  NOTIF_MODULE_SETTINGS: "/super-admin/notifications/module",
  NOTIF_ROLE_SETTINGS: "/super-admin/notifications/roles",
  NOTIF_TEMPLATE_SETTINGS: "/super-admin/notifications/templates",
  NOTIF_GLOBAL_SETTINGS: "/super-admin/notifications/global",
  NOTIF_LOGS: "/super-admin/notifications/logs",
};
