/**
 * @file notificationService.js
 * @description Service module for handling all notification-related API calls
 * @module services/notificationService
 * @requires axios
 * @version 1.0.0
 * @example
 * import {
 *   saveNotificationToken,
 *   getNotificationTypes,
 *   updateNotificationSettings,
 *   getNotificationLogs
 * } from '../services/notificationService';
 */

import axios from "axios";

/** @constant {string} API - Base URL for notification API endpoints */
const API = "http://localhost:5000/api/notifications";

/**
 * Saves a device's notification token to the server
 * @async
 * @function saveNotificationToken
 * @param {Object} payload - The token data to save
 * @param {string} payload.token - The FCM token
 * @param {string} payload.uid - User ID
 * @param {string} payload.role - User role
 * @returns {Promise<Object>} Response data from the server
 * @throws {Error} If the request fails
 * @example
 * await saveNotificationToken({
 *   token: 'fcm-token-123',
 *   uid: 'user-123',
 *   role: 'admin'
 * });
 */
export const saveNotificationToken = async (payload) => {
  const res = await axios.post(`${API}/save-token`, payload);
  return res.data;
};

/**
 * Fetches all available notification types from the server
 * @async
 * @function getNotificationTypes
 * @returns {Promise<Array<Object>>} Array of notification types
 * @throws {Error} If the request fails
 * @example
 * const types = await getNotificationTypes();
 * // Returns: [{ event: 'user.registered', name: 'User Registration', ... }]
 */
export const getNotificationTypes = async () => {
  const res = await axios.get(`${API}/types`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Fetches all notification settings
 * @async
 * @function getNotificationSettings
 * @returns {Promise<Array<Object>>} Array of notification settings
 * @throws {Error} If the request fails
 * @example
 * const settings = await getNotificationSettings();
 */
export const getNotificationSettings = async () => {
  const res = await axios.get(`${API}/settings`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Updates notification settings
 * @async
 * @function updateNotificationSettings
 * @param {Object} payload - The settings to update
 * @param {string} payload.event - The event name
 * @param {boolean} payload.enabled - Whether the notification is enabled
 * @param {Object} payload.channels - Channel settings (email, push, etc.)
 * @returns {Promise<Object>} Updated settings
 * @throws {Error} If the request fails
 */
export const updateNotificationSettings = async (payload) => {
  const res = await axios.post(`${API}/settings`, payload);
  return res.data;
};

/**
 * Fetches settings for a specific event
 * @async
 * @function getEventSetting
 * @param {string} event - The event name to get settings for
 * @returns {Promise<Object>} Event settings
 * @throws {Error} If the request fails
 */
export const getEventSetting = async (event) => {
  const res = await axios.get(`${API}/settings/${event}`);
  return res.data;
};

/**
 * Fetches the template for a specific notification event
 * @async
 * @function getTemplate
 * @param {string} event - The event name
 * @returns {Promise<Object>} Template data
 * @throws {Error} If the request fails
 */
export const getTemplate = async (event) => {
  const res = await axios.get(`${API}/template/${event}`);
  return res.data;
};

/**
 * Updates a notification template
 * @async
 * @function updateTemplate
 * @param {string} event - The event name
 * @param {Object} payload - Template data
 * @param {string} payload.title - Notification title template
 * @param {string} payload.body - Notification body template
 * @returns {Promise<Object>} Updated template
 * @throws {Error} If the request fails
 */
export const updateTemplate = async (event, payload) => {
  const res = await axios.post(`${API}/template/${event}`, payload);
  return res.data;
};

/* =========================================================
   ROLE-BASED SETTINGS
   (Uses the same API as module settings; we only send notifyRoles)
   ========================================================= */
/**
 * Updates role-based notification settings for an event
 * @async
 * @function updateNotifyRoles
 * @param {string} event - The event name
 * @param {Array<string>} notifyRoles - Array of role names to notify
 * @returns {Promise<Object>} Updated settings
 * @throws {Error} If the request fails
 */
export const updateNotifyRoles = async (event, notifyRoles) => {
  const res = await axios.post(`${API}/settings`, {
    event,
    notifyRoles,
  });
  return res.data;
};

/* =========================================================
   USER NOTIFICATION PREFERENCES
   (You will add these backend APIs soon)
   ========================================================= */

/**
 * Fetches the current user's notification preferences
 * @async
 * @function getUserNotificationPrefs
 * @returns {Promise<Object>} User notification preferences
 * @throws {Error} If the request fails
 */
export const getUserNotificationPrefs = async () => {
  const res = await axios.get(`${API}/user-prefs`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Updates a user's notification preferences
 * @async
 * @function updateUserNotificationPref
 * @param {string} uid - User ID
 * @param {Object} payload - Preferences to update
 * @returns {Promise<Object>} Updated preferences
 * @throws {Error} If the request fails
 */
export const updateUserNotificationPref = async (uid, payload) => {
  const res = await axios.post(`${API}/user-prefs/${uid}`, payload);
  return res.data;
};

/* =========================================================
   TEST NOTIFICATION
   ========================================================= */
/**
 * Sends a test notification
 * @async
 * @function sendTestNotification
 * @param {Object} payload - Test notification data
 * @param {string} payload.uid - Target user ID
 * @param {string} payload.event - Event type
 * @param {Object} [payload.data] - Additional data to include
 * @returns {Promise<Object>} Response from the server
 * @throws {Error} If the request fails
 */
export const sendTestNotification = async (payload) => {
  const res = await axios.post(`${API}/test`, payload);
  return res.data;
};

/**
 * Fetches notification logs with optional filtering
 * @async
 * @function getNotificationLogs
 * @param {Object} [query={}] - Query parameters
 * @param {string} [query.event] - Filter by event type
 * @param {string} [query.role] - Filter by role
 * @param {string} [query.status] - Filter by status
 * @param {number} [query.limit=10] - Number of logs to return
 * @param {number} [query.page=1] - Page number
 * @returns {Promise<Array<Object>>} Array of notification logs
 * @throws {Error} If the request fails
 */
export const getNotificationLogs = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await axios.get(`${API}/logs?${params}`);
  return res.data;
};

