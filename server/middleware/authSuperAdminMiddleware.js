/**
 * Middleware to authorize only Super Admin users.
 * Must be used after `authenticateUser` middleware.
 *
 * @param {import("express").Request} req  - Express request object, must have `req.user` set
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Next middleware function
 * @returns {void|Response} Sends 403 response if user is not super-admin, else calls next()
 */
const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "super-admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Super Admins only." });
  }
  next();
};

export default authorizeSuperAdmin;
