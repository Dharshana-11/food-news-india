/**
 * @file sessionController.js
 * @description Handles session creation, refresh, and logout logic for authenticated users.
 */

import Users from "../models/User.js";
import UserSession from "../models/UserSession.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new session for a verified user.
 * Closes all other active sessions and issues new session and refresh tokens.
 *
 * @async
 * @function createSession
 * @param {import("express").Request} req - Express request object (expects authenticated `req.user`).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const createSession = async (req, res) => {
  try {
    // authenticateUser middleware provides the verified user's uid
    const { uid } = req.user;
    console.log("Successfully verified ID token for user:", uid);

    // Ensure user exists in the Users collection
    const user = await Users.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // Close all other active sessions for this user
    await UserSession.updateMany(
      { uid, isActive: true, expiresAt: { $gt: now } },
      { isActive: false, logoutTime: now },
    );

    const sessionTTL = parseInt(process.env.SESSION_TTL_HOURS || "1", 10);
    const expiresAt = new Date(Date.now() + sessionTTL * 60 * 60 * 1000);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

    // Create a new session document
    const newSession = await UserSession.create({
      uid,
      loginTime: now,
      isActive: true,
      sessionToken: uuidv4(),
      expiresAt,
      refreshToken: uuidv4(),
      refreshExpiresAt,
    });

    // Set HTTP-only cookies for tokens
    res.cookie("sessionToken", newSession.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      // secure: false,
      // sameSite: "Lax",
      maxAge: sessionTTL * 60 * 60 * 1000,
      expires: expiresAt,
    });

    res.cookie("refreshToken", newSession.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      expires: refreshExpiresAt,
    });

    return res.json({ message: "Session created successfully", user });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    if (error.code === "auth/argument-error") {
      return res
        .status(401)
        .json({ message: "Invalid or expired Firebase token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logs out a user by invalidating their session token.
 *
 * @async
 * @function logoutSession
 * @param {import("express").Request} req - Express request object (expects session cookies).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const logoutSession = async (req, res) => {
  try {
    // Extract session token
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({ message: "Session token required" });
    }

    // Check if session exists and is active
    const session = await UserSession.findOne({
      sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "Active session not found or already logged out" });
    }

    // Invalidate the session
    session.isActive = false;
    session.logoutTime = new Date();
    await session.save();

    // Clear cookies
    res.clearCookie("sessionToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Refreshes a user's session by rotating tokens and creating a new active session.
 * The old refresh token is marked as rotated to prevent reuse.
 *
 * @async
 * @function refreshSession
 * @param {import("express").Request} req - Express request object (expects refresh token cookie).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Atomic update to prevent race conditions
    const session = await UserSession.findOneAndUpdate(
      {
        refreshToken,
        isActive: true,
        rotated: false,
        refreshExpiresAt: { $gt: new Date() },
      },
      { $set: { rotated: true, isActive: false, logoutTime: new Date() } },
      { new: true },
    );

    console.log("Cookies received at refresh:", req.cookies);
    console.log("Found session:", session);

    if (!session) {
      const expiredSession = await UserSession.findOne({ refreshToken });
      if (expiredSession) {
        expiredSession.isActive = false;
        expiredSession.logoutTime = new Date();
        await expiredSession.save();
      }
      return res
        .status(401)
        .json({ message: "Active session not found or already logged out" });
    }

    // Generate new tokens and expiry times
    const newSessionToken = uuidv4();
    const newRefreshToken = uuidv4();
    const sessionTTL = parseInt(process.env.SESSION_TTL_HOURS || "1", 10);
    const refreshTTL = parseInt(process.env.REFRESH_TTL_DAYS || "7", 10);
    const expiresAt = new Date(Date.now() + sessionTTL * 60 * 60 * 1000);
    const refreshExpiresAt = new Date(
      Date.now() + refreshTTL * 24 * 60 * 60 * 1000,
    );

    // Create new active session
    await UserSession.create({
      uid: session.uid,
      loginTime: new Date(),
      logoutTime: null,
      isActive: true,
      sessionToken: newSessionToken,
      expiresAt,
      refreshToken: newRefreshToken,
      refreshExpiresAt,
      rotated: false,
    });

    // Set refreshed cookies
    res.cookie("sessionToken", newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: sessionTTL * 60 * 60 * 1000,
      expires: expiresAt,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: refreshTTL * 24 * 60 * 60 * 1000,
      expires: refreshExpiresAt,
    });

    return res.json({ message: "Session refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
