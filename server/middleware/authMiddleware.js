/**
 * Middleware to authenticate users via Firebase ID token.
 *
 * Process:
 * 1. Reads the `Authorization` header and extracts the Bearer token.
 * 2. Verifies the token using Firebase Admin SDK.
 * 3. Checks whether the user exists in the database (Admins collection).
 * 4. Attaches user info to `req.user` for further request handling.
 * 5. Responds with `401` (invalid/missing token) or `403` (not authorized) when access is denied.
 *
 * @async
 * @function authenticateUser
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Callback to pass control to the next middleware.
 * @returns {Promise<void>} Sends authentication error response or calls `next()` on success.
 *
 * @example
 * // Use in a secured route:
 * router.get("/admin/dashboard", authenticateUser, (req, res) => {
 *   res.json({ message: `Welcome ${req.user.name}` });
 * });
 */


import firebaseAdmin from "../firebase/firebase.js";      // Firebase admin SDK instance
import Users from "../models/User.js";
import AdminModel from "../models/Admin.js";

/**
 * Middleware to authenticate requests using Firebase ID token.
 * Checks if the token is valid and whether the user exists in Admin collection.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify Firebase ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    // Find admin user in database
    const user = await Users.findOne({ uid });
    if (!user) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    // Attach user info to request object for downstream middlewares/controllers
    req.user = {
      uid: user.uid,
      role: user.role,
      name: user.name,
      identifier: user.email || user.phone, // identifier used for login
      isVerified: user.isVerified,
    };

    next(); // proceed to next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateUser;
