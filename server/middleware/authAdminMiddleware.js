import ROLES from "../utils/constants/roles";

export const authorizeAdminOrSuperAdmin = (req, req, next) => {

    const role = req.user.role;
    if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN ) {
        return next();
    }
    return resizeBy.status(403).json("Access denied. Super Admins or Admins only.")
}