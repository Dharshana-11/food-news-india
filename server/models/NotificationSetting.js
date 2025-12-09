/**
 * @file Notification Setting Model
 * @description Defines the schema for notification settings that control how and when notifications are sent
 * @module models/NotificationSetting
 */

import mongoose from "mongoose";

/**
 * @typedef NotificationSetting
 * @property {string} event - Unique identifier for the notification event (maps to NotificationType.event)
 * @property {boolean} [enabled=true] - Global toggle to enable/disable notifications for this event
 * @property {Object} channels - Configuration for different notification channels
 * @property {boolean} [channels.push=true] - Enable/disable push notifications
 * @property {boolean} [channels.email=false] - Enable/disable email notifications
 * @property {boolean} [channels.sms=false] - Enable/disable SMS notifications
 * @property {boolean} [channels.web=true] - Enable/disable web notifications
 * @property {string[]} [notifyRoles=[]] - Roles that should receive this notification by default
 * @property {Date} [createdAt] - When the setting was created
 * @property {Date} [updatedAt] - When the setting was last updated
 */

/**
 * Notification setting schema definition
 * @type {mongoose.Schema}
 */
const NotificationSettingSchema = new mongoose.Schema({
  event: { type: String, required: true, unique: true }, // maps to NotificationType.event
  enabled: { type: Boolean, default: true }, // global toggle for this event
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    web: { type: Boolean, default: true }
  },
  notifyRoles: [{ type: String }], // roles to notify by default, e.g. ['super_admin','admin']
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Create and export the NotificationSetting model
const NotificationSetting = mongoose.model("NotificationSetting", NotificationSettingSchema);

export default NotificationSetting;
