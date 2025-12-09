import User from "../models/User.js";

/**
 * Middleware to prevent duplicate user creation based on `email` or `phone`.
 *
 * 🔍 Behavior:
 * - Checks whether an incoming request contains an email or phone.
 * - If present, verifies whether a user already exists with the same email/phone.
 * - If a duplicate is found, responds with `409 Conflict`.
 *
 * 🛑 Intended for use during **user registration / account creation** only.
 *
 * @async
 * @function checkDuplicateUser
 * @param {import("express").Request} req - Express request object containing user data in `req.body`.
 * @param {import("express").Response} res - Express response object used to return HTTP errors.
 * @param {import("express").NextFunction} next - Callback to continue request handling if no duplicate is found.
 * @returns {Promise<void>} Sends a conflict or server error response, or calls `next()` on success.
 *
 * @example
 * // Usage in registration route:
 * router.post("/register", checkDuplicateUser, registerUser);
 */
const checkDuplicateUser = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    // Check email duplicate
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ error: `User already exists with the email: ${email}` });
      }
    }

    // Check phone duplicate
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ error: `User already exists with the phone number: ${phone}` });
      }
    }

    next();
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default checkDuplicateUser;
