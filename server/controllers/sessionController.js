/**
 * @file sessionController.js
 * @description Handles session creation, refresh, and logout logic for authenticated users.
 */

import Users from "../models/User.js";
import UserSession from "../models/UserSession.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new authenticated session for a verified user.
 * Closes all other active sessions for the same user before creating a new one.
 *
 * @function createSession
 * @param {import("express").Request} req - Express request object (expects req.user.uid)
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 */
export const createSession = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await Users.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // Close all other valid active sessions
    await UserSession.updateMany(
      { uid, isActive: true, expiresAt: { $gt: now } },
      { isActive: false, logoutTime: now },
    );

    const sessionTTL = Number(process.env.SESSION_TTL_HOURS ?? 1);
    const refreshTTL = Number(process.env.REFRESH_TTL_DAYS ?? 7);

    const expiresAt = new Date(Date.now() + sessionTTL * 3600 * 1000);
    const refreshExpiresAt = new Date(Date.now() + refreshTTL * 86400 * 1000);

    const sessionToken = uuidv4();
    const refreshToken = uuidv4();

    await UserSession.create({
      uid,
      loginTime: now,
      isActive: true,
      sessionToken,
      expiresAt,
      refreshToken,
      refreshExpiresAt,
      rotated: false,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/",
    };

    res.cookie("sessionToken", sessionToken, {
      ...cookieOptions,
      maxAge: sessionTTL * 3600 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTTL * 86400 * 1000,
    });

    return res.json({
      message: "Session created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Refreshes a user session by rotating both access and refresh tokens.
 * Old tokens are invalidated shortly after returning the response.
 *
 * @function refreshSession
 * @param {import("express").Request} req - Express request object (reads cookies)
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 */
export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const session = await UserSession.findOne({
      refreshToken,
      isActive: true,
      rotated: false,
      refreshExpiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const sessionTTL = Number(process.env.SESSION_TTL_HOURS ?? 1);
    const refreshTTL = Number(process.env.REFRESH_TTL_DAYS ?? 7);

    const newSessionToken = uuidv4();
    const newRefreshToken = uuidv4();

    const expiresAt = new Date(Date.now() + sessionTTL * 3600 * 1000);
    const refreshExpiresAt = new Date(Date.now() + refreshTTL * 86400 * 1000);

    // Create new active session
    await UserSession.create({
      uid: session.uid,
      loginTime: new Date(),
      isActive: true,
      sessionToken: newSessionToken,
      expiresAt,
      refreshToken: newRefreshToken,
      refreshExpiresAt,
      rotated: false,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/",
    };

    res.cookie("sessionToken", newSessionToken, {
      ...cookieOptions,
      maxAge: sessionTTL * 3600 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: refreshTTL * 86400 * 1000,
    });

    // Response sent first
    res.json({
      message: "Session refreshed successfully",
      success: true,
    });

    // Gracefully rotate old session afterwards
    setTimeout(async () => {
      try {
        session.isActive = false;
        session.rotated = true;
        session.logoutTime = new Date();
        await session.save();
      } catch (err) {
        console.error("Error rotating old session:", err);
      }
    }, 2000);
  } catch (error) {
    console.error("Error refreshing session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logs out a user by invalidating their current session token.
 * Also clears the associated cookies.
 *
 * @function logoutSession
 * @param {import("express").Request} req - Express request object (reads cookies)
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 */
export const logoutSession = async (req, res) => {
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({ message: "Session token required" });
    }

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

    session.isActive = false;
    session.logoutTime = new Date();
    await session.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/",
    };

    res.clearCookie("sessionToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
