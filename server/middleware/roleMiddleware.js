/**
 * Middleware to authorize only Super Admin users.
 * Assumes `authenticateUser` has already run and attached `req.user`.
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
