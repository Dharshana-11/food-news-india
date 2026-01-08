import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";
import {
  createUser,
  getAllUsers,
  updateUserById,
  verifyUser,
  rejectUser,
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";
import validateRole from "../middleware/validateRole.js";
import checkDuplicateUser from "../middleware/checkDuplicateUser.js";
import checkDuplicateForUpdate from "../middleware/checkDuplicateForUpdate.js";
import checkUserExists from "../middleware/checkUserExists.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * User Routes Module
 *
 * Handles:
 *  Self-user actions (`/me`) – view, update, delete own account
 *  Admin/Super Admin actions – create, view, update, verify, reject, delete users
 *
 *  All routes require **verifySession** before accessing user data.
 *
 * Super Admin-only actions:
 * - Create user
 * - Verify / Reject user
 * - Delete user
 *
 * @module UserRoutes
 * @example Base URL: `/api/users`
 */

// ====================== SELF USER ROUTES ======================

/**
 *  GET Self Profile
 * @route GET /users/me
 * @access Logged-in user
 */
router.get("/me", verifySession, getMyProfile);

/**
 * UPDATE Self Profile
 * @route PUT /users/me
 * @access Logged-in user
 */
router.patch("/me", verifySession, updateMyProfile);

/**
 * DELETE Self Account
 * @route DELETE /users/me
 * @access Logged-in user
 */
router.delete("/me", verifySession, async (req, res) => {
  await User.findOneAndUpdate(
    { uid: req.user.uid },
    { $set: { isDeleted: true } }
  );
  res.status(200).json({ message: "Account deactivated" });
});

// ====================== ADMIN & SUPER ADMIN ROUTES ======================

/**
 * CREATE USER (Admin roles only)
 * @route POST /users/
 * @access Super Admin only
 */
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateRole,
  checkDuplicateUser,
  createUser
);

/**
 *  GET ALL USERS
 * @route GET /users/
 * @access Admin & Super Admin
 */
router.get(
  "/",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getAllUsers
);

/**
 *  GET User By UID
 * @route GET /users/:uid
 * @access Admin & Super Admin
 */
router.get(
  "/:uid",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  checkUserExists,
  async (req, res) => {
    return res.status(200).json(req.userData);
  }
);

/**
 * UPDATE USER By UID
 * @route PUT /users/:uid
 * @access Admin & Super Admin
 */
router.put(
  "/:uid",
  verifySession,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  checkUserExists,
  checkDuplicateForUpdate,
  updateUserById
);

/**
 * VERIFY USER
 * @route PATCH /users/:uid/verify
 * @access Super Admin only
 */
router.patch(
  "/:uid/verify",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  verifyUser
);

/**
 *  REJECT USER
 * @route PATCH /users/:uid/reject
 * @access Super Admin only
 */
router.patch(
  "/:uid/reject",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  rejectUser
);

/**
 *  DELETE USER By UID
 * @route DELETE /users/:uid
 * @access Super Admin only
 */
/**
 *  DELETE USER By UID (Soft Delete)
 * @route DELETE /users/:uid
 * @access Super Admin only
 */
router.delete(
  "/:uid",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  async (req, res) => {
    await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: { isDeleted: true } }
    );

    return res.status(200).json({ message: "User deleted successfully" });
  }
);

export default router;
