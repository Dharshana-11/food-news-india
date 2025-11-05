/**
 * superAdminRoutes.js
 * ------------------------------------------------------------
 * Defines routes specific to Super Admin functionality.
 * Includes protected endpoints accessible only by users
 * with the 'super_admin' role.
 * ------------------------------------------------------------
 */

import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import authorizeSuperAdmin from "../middleware/authSuperAdminMiddleware.js";
import { verifySession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/super-admin/dashboard
 * @description Returns Super Admin dashboard information.
 * Ensures that the requester is authenticated, authorized,
 * and has a valid session.
 * @access Private (Super Admin only)
 */
router.get(
  "/dashboard",
  authenticateUser,      // Validates JWT and attaches user to request
  authorizeSuperAdmin,   // Ensures user role === 'super_admin'
  verifySession,         // Validates active session token
  (req, res) => {
    return res.status(200).json({
      message: "Super Admin dashboard access granted",
      user: req.user,
    });
  }
);

export default router;
