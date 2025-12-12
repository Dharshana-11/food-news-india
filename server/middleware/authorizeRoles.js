/**
 * Middleware for role-based authorization.
 *
 * Supports two behaviors:
 * 1. **With `req.params.uid` present**  
 *    - Allows access only if the requester is the same user (`req.user.uid === params.uid`)
 *      OR has a role included in `allowedRoles`.
 *
 * 2. **Without UID in route params**  
 *    - Grants access only if the user's role is included in `allowedRoles`.
 *
 * @function authorizeRoles
 * @param {...string} allowedRoles - List of permitted roles (e.g., "admin", "super_admin").
 * @returns {function} Express middleware function that checks user authorization.
 *
 * @example
 * // Only admin and super_admin can delete users
 * router.delete("/users/:uid", authorizeRoles("admin", "super_admin"), deleteUser);
 *
 * @example
 * // Agents and business owners can view their own ticket, but only admin can view others
 * router.get("/tickets/:uid", authorizeRoles("admin", "agent", "business_owner"), getTickets);
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Case 1: If route has a uid param, only allow if user owns it OR has allowed role
    if (req.params.uid) {
      if (req.user.uid !== req.params.uid && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied: Only [${allowedRoles.join(", ")}] can access this resource. Your role: ${req.user.role}`,
        });
      }
    } 
    // Case 2: Routes without UID param → only check role
    else if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Only [${allowedRoles.join(", ")}] can access this resource. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};
