/**
 * authController.js
 * ============================================================================
 * Handles authentication operations including:
 * - User verification after Firebase auth
 * - New user detection and profile completion
 * - Role and name updates for new users
 */

import Users from "../models/User.js";
import ROLES from "../utils/constants/roles.js";

// Valid roles for new user registration
const ALLOWED_REGISTRATION_ROLES = [
  ROLES.BUSINESS_OWNER,
  ROLES.AGENT,
  ROLES.SERVICE_PROVIDER,
];

/**
 * Verify user after Firebase authentication
 * Returns user data if exists, or flags as new user
 *
 * @route GET /api/auth/verify
 * @access Private (requires Firebase auth)
 */
export const verifyUser = async (req, res) => {
  try {
    const { uid } = req.user;

    // Check if user exists in database
    let user = await Users.findOne({ uid });

    // User exists - return their data
    if (user) {
      // Block deleted or rejected users
      if (user.isDeleted) {
        return res.status(403).json({
          message: "Account has been deleted",
          code: "ACCOUNT_DELETED",
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Account access has been rejected",
          code: "ACCOUNT_REJECTED",
          reason: user.rejectionReason,
        });
      }

      return res.json({
        exists: true,
        user: user.toObject(),
        message: "User verified successfully",
      });
    }

    // New user - extract phone from Firebase
    const phoneNumber = req.user.phoneNumber || req.user.phone;

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number not found in authentication data",
      });
    }

    // Return flag indicating this is a new user
    return res.json({
      exists: false,
      uid,
      phone: phoneNumber,
      message: "New user detected - profile completion required",
    });
  } catch (error) {
    console.error("User verification error:", error);
    return res.status(500).json({
      message: "Internal server error during verification",
    });
  }
};

/**
 * Complete new user profile
 * Creates user account with role and name
 *
 * @route POST /api/auth/complete-profile
 * @access Private (requires Firebase auth)
 */
export const completeProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, role } = req.body;

    // Validation
    if (!name || !role) {
      return res.status(400).json({
        message: "Name and role are required",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    // Validate role is allowed for self-registration
    if (!ALLOWED_REGISTRATION_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selection",
        allowedRoles: ALLOWED_REGISTRATION_ROLES,
      });
    }

    // Check if user already exists (prevent duplicate creation)
    const existingUser = await Users.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({
        message: "User profile already exists",
        user: existingUser,
      });
    }

    // Extract phone from Firebase user data
    const phoneNumber = req.user.phoneNumber || req.user.phone;

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number not found",
      });
    }

    // Create new user
    const newUser = await Users.create({
      uid,
      phone: phoneNumber,
      name: name.trim(),
      role,
      // isVerified: true, // Firebase already verified the phone
      // status: "verified",
      updatedBy: uid, // Self-created
    });

    return res.status(201).json({
      message: "Profile completed successfully",
      user: newUser.toObject(),
    });
  } catch (error) {
    console.error("Profile completion error:", error);

    // Handle duplicate phone number
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({
        message: "This phone number is already registered",
      });
    }

    return res.status(500).json({
      message: "Internal server error during profile completion",
    });
  }
};
