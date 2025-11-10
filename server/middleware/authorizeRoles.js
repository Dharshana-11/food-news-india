import ROLES from "../utils/constants/roles.js";

/**
 * Middleware to authorize Admin or Super Admin users
 */
export const authorizeAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Super Admins or Admins only." });
};

/**
 * Middleware to authorize only Super Admin users
 */
export const authorizeSuperAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({ message: "Access denied. Super Admins only." });
  }
  next();
};

/**
 * Optional: generic role-based middleware
 * Usage: authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied." });
  }
  next();
};
