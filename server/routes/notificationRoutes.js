import express from "express";
import {
  saveToken,
  getNotificationTypes,
  getNotificationSettings,
  updateNotificationSettings,
  getEventSetting,
  updateTemplate,
  getTemplate,
  // sendTestNotification,
  getNotificationLogs
} from "../controllers/notificationController.js";

import sendNotification from "../utils/sendNotification.js";

const router = express.Router();

/**
 * Notification Routes
 *
 * Handles:
 * - Saving device/browser notification tokens
 * - Retrieving available notification types
 * - Getting and updating user notification settings
 * - Managing event templates used for notifications
 * - Triggering internal notifications
 * - Fetching notification logs
 *
 * @module NotificationRoutes
 * @requires express
 * @example
 * // Base URL:
 * // /api/notifications
 */

// ---- TOKEN ----

/**
 * Save FCM token for push notifications.
 * @route POST /notifications/save-token
 */
router.post("/save-token", saveToken);

// ---- TYPES ----

/**
 * Get all available notification types (e.g., SMS, PUSH, EMAIL).
 * @route GET /notifications/types
 */
router.get("/types", getNotificationTypes);

// ---- SETTINGS ----

/**
 * Retrieve global/default notification settings.
 * @route GET /notifications/settings
 */
router.get("/settings", getNotificationSettings);

/**
 * Update global/default notification settings.
 * @route POST /notifications/settings
 */
router.post("/settings", updateNotificationSettings);

/**
 * Retrieve settings for a specific event type.
 * @route GET /notifications/settings/:event
 */
router.get("/settings/:event", getEventSetting);

// ---- TEMPLATES ----

/**
 * Get message template for a specific notification event.
 * @route GET /notifications/template/:event
 */
router.get("/template/:event", getTemplate);

/**
 * Update message template for a specific notification event.
 * @route POST /notifications/template/:event
 */
router.post("/template/:event", updateTemplate);

// ---- SEND ----
console.log("Notification routes loaded");

/**
 * Send notification manually (internal service usage only).
 * @route POST /notifications/send
 */
router.post("/send", sendNotification);

// ---- LOGS ----

/**
 * Get logs of all sent notifications.
 * @route GET /notifications/logs
 */
router.get("/logs", getNotificationLogs);

export default router;
