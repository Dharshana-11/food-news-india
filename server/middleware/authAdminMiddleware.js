import ROLES from "../utils/constants/roles.js";

export const authorizeAdminOrSuperAdmin = (req, res, next) => {

    const role = req.user.role;
    if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN ) {
        return next();
    }
    return res.status(403).json({message: "Access denied. Super Admins or Admins only."})
}