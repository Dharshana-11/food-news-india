/**
 * Centralized route paths for the application.
 * Using constants avoids hardcoding paths in multiple files,
 * making maintenance easier as the app grows.
 */
export const ROUTES = {
  // Public routes
  LOGIN: "/",
  ADMIN_LOGIN: "/admin/login",

  // Super Admin protected routes
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  SUPER_ADMIN_USERS: "/super-admin/users",
};
