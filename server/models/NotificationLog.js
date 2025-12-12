/**
 * @file Notification Log Model
 * @description Defines the schema for logging notification delivery attempts
 * @module models/NotificationLog
 */

import mongoose from "mongoose";

/**
 * @typedef NotificationLog
 * @property {string} event - The notification event type (e.g., 'ticket_created', 'user_verified')
 * @property {string} [uid] - ID of the targeted user (if applicable)
 * @property {string} [role] - Role of the targeted users (if applicable)
 * @property {string[]} [tokens] - Array of device tokens that were targeted
 * @property {'push'|'email'|'sms'} channel - The notification channel used
 * @property {string} title - The notification title
 * @property {string} body - The notification message body
 * @property {number} successCount - Number of successful deliveries
 * @property {number} failureCount - Number of failed deliveries
 * @property {Object} [rawResponse] - Raw response from the notification service
 * @property {Date} [createdAt] - When the notification was logged
 */

/**
 * Notification log schema definition
 * @type {mongoose.Schema}
 */
const LogSchema = new mongoose.Schema({
  event: String,
  uid: String,           // targeted user (if any)
  role: String,          // targeted role (if any)
  tokens: [String],      // tokens attempted
  channel: String,       // 'push' | 'email' | 'sms'
  title: String,
  body: String,
  successCount: Number,
  failureCount: Number,
  rawResponse: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});
// Create and export the NotificationLog model
const NotificationLog = mongoose.model("NotificationLog", LogSchema);

export default NotificationLog;
