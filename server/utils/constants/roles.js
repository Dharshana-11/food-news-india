/**
 * @file roles.js
 * @description Defines the available user roles within the application.
 * These roles are used for access control and authorization logic.
 */

/**
 * Enum-like object representing user roles.
 * @readonly
 * @enum {string}
 */
const ROLES = {
  /** Highest-level role with full permissions across the platform. */
  SUPER_ADMIN: "super_admin",

  /** Administrative role with elevated management permissions. */
  ADMIN: "admin",

  /** Agent-level role responsible for handling user or client requests. */
  AGENT: "agent",

  /** Role assigned to business owners managing their own data. */
  BUSINESS_OWNER: "business_owner",

  /** Role for service providers offering or managing services. */
  SERVICE_PROVIDER: "service_provider",
};

export default ROLES;
