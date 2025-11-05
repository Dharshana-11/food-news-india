/**
 * @file sessionMiddleware.js
 * @description Middleware to verify active user sessions using session tokens stored in cookies.
 */

import Users from "../models/Users.js";
import UserSession from "../models/UserSession.js";

/**
 * Verifies if a user's session token is valid and active.
 * 
 * @async
 * @function verifySession
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * 
 * @returns {Promise<void | import("express").Response>} Proceeds to the next middleware if valid; otherwise sends an error response.
 */
export const verifySession = async (req, res, next) => {
  try {
    // Extract session token from cookie
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({ message: "Session token required!" });
    }

    // Check if session is active
    const session = await UserSession.findOne({ sessionToken, isActive: true });

    if (!session) {
      return res.status(401).json({ message: "Session expired. Please refresh." });
    }

    // Check if session has expired by time
    if (new Date() > session.expiresAt) {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    // Fetch associated user details
    const user = await Users.findOne({ uid: session.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Attach user info to the request for downstream usage
    req.user = user;

    next();
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
