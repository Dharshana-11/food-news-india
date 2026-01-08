import ROLES from "../utils/constants/roles.js";
import { hasAgentBusinessAccess } from "../services/agentBusinessAccessService.js";

/**
 * Middleware to authorize AGENT access to a business.
 * Business owners, admins, providers bypass this check.
 *
 * @param {(req) => string|ObjectId} resolveBusinessOwnerId
 */
export const authorizeAgentForBusiness = (resolveBusinessOwnerId) => {
  return async (req, res, next) => {
    try {
      // Only agents need delegation validation
      if (req.user.role !== ROLES.AGENT) {
        return next();
      }

      const businessOwnerId = resolveBusinessOwnerId(req);

      if (!businessOwnerId) {
        return res.status(400).json({
          success: false,
          message: "Business context is required for agent access",
        });
      }

      const allowed = await hasAgentBusinessAccess({
        agentId: req.user._id,
        businessOwnerId,
      });

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Agent not authorized for this business",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
