/**
 * @file Notification Template Model
 * @description Defines the schema for notification message templates
 * @module models/NotificationTemplate
 */

import mongoose from "mongoose";

/**
 * @typedef NotificationTemplate
 * @property {string} event - Unique identifier for the notification event
 * @property {string} [titleTemplate=''] - Template for the notification title (supports variables like {{ticketId}})
 * @property {string} [bodyTemplate=''] - Template for the notification body (supports variables like {{userName}})
 * @property {Date} [createdAt] - When the template was created
 * @property {Date} [updatedAt] - When the template was last updated
 * @example
 * // Example template for ticket creation
 * {
 *   event: 'ticket_created',
 *   titleTemplate: 'New Ticket #{{ticketId}}',
 *   bodyTemplate: 'A new ticket has been created by {{userName}} with priority {{priority}}.'
 * }
 */

/**
 * Notification template schema definition
 * @type {mongoose.Schema}
 */
const TemplateSchema = new mongoose.Schema({
  event: { type: String, required: true, unique: true },
  titleTemplate: { type: String, default: "" },    // e.g. "New ticket #{{ticketId}}"
  bodyTemplate: { type: String, default: "" },     // template variables supported
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Create and export the NotificationTemplate model
const NotificationTemplate = mongoose.model("NotificationTemplate", TemplateSchema);

export default NotificationTemplate;
