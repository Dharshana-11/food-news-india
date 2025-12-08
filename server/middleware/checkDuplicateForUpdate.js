import User from "../models/User.js";

/**
 * Middleware to prevent duplicate `email` or `phone` during user profile update.
 *
 * 🔍 Behavior:
 * - Automatically determines whether the update is for self (`/me`) or another user (`/:uid`)
 * - Checks if another user already exists with the same email/phone
 * - Excludes the target user from the duplicate check
 *
 * 🛑 If duplicate found → returns `409 Conflict` with a descriptive message
 *
 * @async
 * @function checkDuplicateForUpdate
 * @param {import("express").Request} req - Express request object, typically containing email/phone in `req.body`
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Callback to pass control to the next middleware
 * @returns {Promise<void>} Sends an error response or proceeds to the next middleware
 *
 * @example
 * // Usage in routes:
 * router.put("/users/:uid", authenticateUser, checkDuplicateForUpdate, updateUser);
 * router.put("/me", authenticateUser, checkDuplicateForUpdate, updateSelfProfile);
 */
const checkDuplicateForUpdate = async (req, res, next) => {
  try {
    // ✅ Detect target UID (either :uid param or current session user)
    const targetUid = req.params.uid || req.user?.uid || req.userData?.uid;

    const { email, phone } = req.body;

    // Skip check if neither email nor phone is being updated
    if (!email && !phone) return next();

    // ✅ Check duplicate email (excluding the target user)
    if (email) {
      const existingEmail = await User.findOne({
        email,
        uid: { $ne: targetUid },
      });
      if (existingEmail) {
        return res
          .status(409)
          .json({ error: `User already exists with the email: ${email}` });
      }
    }

    // ✅ Check duplicate phone (excluding the target user)
    if (phone) {
      const existingPhone = await User.findOne({
        phone,
        uid: { $ne: targetUid },
      });
      if (existingPhone) {
        return res
          .status(409)
          .json({
            error: `User already exists with the phone number: ${phone}`,
          });
      }
    }

    next();
  } catch (err) {
    console.error("Duplicate check error (update):", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default checkDuplicateForUpdate;
