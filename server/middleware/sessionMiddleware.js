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
    console.log("=== VERIFY SESSION CALLED ===");
    console.log("URL:", req.url);
    console.log("Cookies:", req.cookies);
    
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      console.log("No session token found");
      return res.status(401).json({ message: "Session token missing or required!" });
    }

    // Check if session is active
    const session = await UserSession.findOne({ sessionToken, isActive: true });

    if (!session) {
      console.log("Session not found or inactive");
      return res.status(401).json({ message: "Session expired. Please refresh." });
    }

    // Check if session has expired by time
    if (new Date() > session.expiresAt) {
      console.log("Session expired by time");
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    const user = await Users.findOne({ uid: session.uid });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Session verified successfully for:", user.email);
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
