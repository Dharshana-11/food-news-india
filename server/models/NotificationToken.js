/**
 * @file Notification Token Model
 * @description Defines the schema for storing device tokens used for push notifications
 * @module models/NotificationToken
 */

import mongoose from "mongoose";

/**
 * @typedef NotificationToken
 * @property {string} uid - The Firebase UID of the user this token belongs to
 * @property {string} token - The device token for push notifications (must be unique)
 * @property {string} [role] - The role of the user (used for role-based notifications)
 * @property {Date} [updatedAt] - When the token was last updated
 * @example
 * {
 *   uid: 'firebase-uid-123',
 *   token: 'device-token-abc123',
 *   role: 'admin',
 *   updatedAt: '2025-12-09T00:00:00.000Z'
 * }
 */

/**
 * Notification token schema definition
 * @type {mongoose.Schema}
 */
const notificationTokenSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  role: { type: String }, 
  updatedAt: { type: Date, default: Date.now }
});

// Create and export the NotificationToken model
const NotificationToken = mongoose.model("NotificationToken", notificationTokenSchema);

export default NotificationToken;
