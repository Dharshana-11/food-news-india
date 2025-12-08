/**
 * Middleware to authorize only Super Admin users.
 *
 * 🔐 Requirements:
 * - Must be used **after** `authenticateUser`, which attaches `req.user`.
 *
 * 🛑 If:
 * - `req.user` is missing → responds with `401 Unauthorized`
 * - User exists but `role` !== `super-admin` → responds with `403 Forbidden`
 *
 * 🟢 If allowed:
 * - Calls `next()` and continues execution.
 *
 * @function authorizeSuperAdmin
 * @param {import("express").Request} req - Express request object containing `req.user` after authentication.
 * @param {import("express").Response} res - Express response object used to send error messages.
 * @param {import("express").NextFunction} next - Callback to move to the next middleware/handler.
 * @returns {void}
 *
 * @example
 * // Usage in routes:
 * router.delete("/admin/remove-user/:uid",
 *   authenticateUser,
 *   authorizeSuperAdmin,
 *   deleteUserController
 * );
 */
const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user) {
    // Safety check: no user attached
    return res.status(401).json({ message: "Unauthorized: No user info" });
  }

  if (req.user.role !== "super-admin") {
    // User exists but is not a super-admin
    return res.status(403).json({ message: "Forbidden: Super Admins only" });
  }

  // User is super-admin, allow request to proceed
  next();
};

export default authorizeSuperAdmin;
