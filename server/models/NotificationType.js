/**
 * @file NotificationType.js
 * @description Defines the schema and Mongoose model for supported notification types (email, SMS, web)
 * @module models/NotificationType
 */

import mongoose from "mongoose";

// ---------------------------------------------
// Notification Type Schema
// ---------------------------------------------
const NotificationTypeSchema = new mongoose.Schema({
  /**
   * Type of notification (e.g., "INVOICE", "ALERT", "REMINDER")
   * @type {String}
   * @required
   */
  type: { type: String, required: true },

  /**
   * Notification channel availability flags
   * Email, SMS, and Web channels determine through which mediums
   * this notification type can be delivered.
   */
  channels: {
    /**
     * If true, the notification supports Email delivery
     * @type {Boolean}
     * @default false
     */
    email: { type: Boolean, default: false },

    /**
     * If true, the notification supports SMS delivery
     * @type {Boolean}
     * @default false
     */
    sms: { type: Boolean, default: false },

    /**
     * If true, the notification supports Web/App notification delivery
     * @type {Boolean}
     * @default true
     */
    web: { type: Boolean, default: true }
  },

  /**
   * Timestamp when the notification type was created
   * @type {Date}
   * @default Date.now
   */
  createdAt: { type: Date, default: Date.now }
});

// ---------------------------------------------
// Export Model
// ---------------------------------------------
/**
 * Mongoose model for Notification Types
 * @type {mongoose.Model}
 */
const NotificationType = mongoose.model("NotificationType", NotificationTypeSchema);

export default NotificationType;
