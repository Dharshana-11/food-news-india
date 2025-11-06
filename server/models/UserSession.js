/**
 * @file UserSession.js
 * @description Mongoose schema defining user session details for authentication and session tracking.
 */

import mongoose from "mongoose";

/**
 * UserSession Schema
 *
 * Represents a user's active or past session, including login/logout timestamps,
 * token validity, and refresh token lifecycle.
 *
 * @typedef {Object} UserSession
 * @property {string} uid - Unique user ID referencing the User model.
 * @property {Date} login_time - Timestamp when the user logged in.
 * @property {Date|null} logout_time - Timestamp when the user logged out (if applicable).
 * @property {boolean} is_active - Whether the session is currently active.
 * @property {string} sessionToken - Unique session token for authentication.
 * @property {Date} expiresAt - Expiry date/time for the session token.
 * @property {string} refreshToken - Token used to refresh the session.
 * @property {Date} refreshExpiresAt - Expiry date/time for the refresh token.
 * @property {boolean} rotated - Indicates whether the refresh token was rotated.
 */

const userSessionSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      ref: "User", // References User model
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    refreshExpiresAt: {
      type: Date,
      required: true,
    },
    rotated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Automatically remove expired sessions based on `expiresAt` field
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("UserSession", userSessionSchema);
