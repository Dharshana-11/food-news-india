import ROLES from "../utils/constants/roles.js";

/**
 * Generic role-based middleware
 * Usage: authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied." });
  }
  next();
};
