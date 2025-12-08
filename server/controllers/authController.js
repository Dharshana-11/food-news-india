/**
 * @file Authentication Controller
 * @description Handles user authentication and verification using Firebase
 * @module controllers/authController
 */

/**
 * Verifies Firebase ID token and returns authenticated user information
 * @route GET /api/auth/verify
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (added by auth middleware)
 * @param {string} req.user.uid - User's unique ID from Firebase
 * @param {string} req.user.email - User's email address
 * @param {string} [req.user.name] - User's display name (optional)
 * @param {string} [req.user.role] - User's role (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user information
 * @example
 * // Response format
 * {
 *   success: true,
 *   message: "User verified successfully",
 *   user: {
 *     uid: "firebase-uid",
 *     email: "user@example.com",
 *     name: "John Doe",
 *     role: "user"
 *   }
 * }
 */
export const verifyUser = (req, res) => {
  // `req.user` is populated by authenticateUser middleware
  // Returning authenticated user info
  return res.status(200).json({
    success: true,
    message: "User verified successfully",
    user: req.user,
  });
};
