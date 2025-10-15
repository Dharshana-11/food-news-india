import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import authorizeSuperAdmin from "../middleware/authSuperAdminMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/super-admin/dashboard
 * @desc    Return dashboard info for Super Admin
 * @access  Private (Super Admin only)
 */
router.get(
  "/dashboard",
  authenticateUser,       // validates token & sets req.user
  authorizeSuperAdmin,    // ensures user is super-admin
  (req, res) => {
    // Respond with minimal user info
    return res.status(200).json({ user: req.user });
  }
);

export default router;
