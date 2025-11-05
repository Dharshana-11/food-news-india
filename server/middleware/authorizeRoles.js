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
