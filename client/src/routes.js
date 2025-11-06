/**
 * Centralized route paths for the application.
 * Using constants avoids hardcoding paths in multiple files,
 * making maintenance easier as the app grows.
 */
export const ROUTES = {
  // Public routes
  LANDING_PAGE: "/",
  LOGIN: "/login",
  ADMIN_LOGIN: "/admin/login",

  // Super Admin protected routes
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",

  SUPER_ADMIN_USERS: "/super-admin/users",
  SUPER_ADMIN_COMPLIANCE: "/super-admin/compliance",
  SUPER_ADMIN_SERVICES: "/super-admin/services",
  SUPER_ADMIN_SUPPORT: "/super-admin/support",
  SUPER_ADMIN_SETTINGS: "/super-admin/settings",
  SUPER_ADMIN_CONTENT: "/super-admin/content",
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  SUPER_ADMIN_PROFILE: "/super-admin/profile",
  SUPER_ADMIN_NOTIFICATIONS: "/super-admin/notifications",
  SUPER_ADMIN_TICKETS: "/super-admin/tickets",
};
