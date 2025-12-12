import NotificationToken from "../models/NotificationToken.js";
import NotificationType from "../models/NotificationType.js";
import NotificationSetting from "../models/NotificationSetting.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import NotificationLog from "../models/NotificationLog.js";
import sendNotificationUtil from "../utils/sendNotification.js";

/**
 * @file Notification Controller
 * @description Handles all notification-related operations including token management,
 * notification settings, templates, and logs.
 * @module controllers/notificationController
 */

/**
 * Saves or updates a device's notification token
 * @route POST /api/notifications/token
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.uid - User ID
 * @param {string} req.body.token - Device notification token
 * @param {string} [req.body.role] - User role (optional)
 * @param {Object} res - Express response object
 * @returns {Object} Success status
 * @throws {400} If uid or token is missing
 * @throws {500} If an internal server error occurs
 */
export const saveToken = async (req, res) => {
  try {
    const { uid, token, role } = req.body;

    if (!uid || !token) {
      return res.status(400).json({ error: "uid and token required" });
    }

    // If this token already exists, update its user
    const existing = await NotificationToken.findOne({ token });

    if (existing) {
      existing.uid = uid;
      existing.updatedAt = Date.now();
      await existing.save();
    } else {
      await NotificationToken.create({ uid, token, role });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieves all notification types
 * @route GET /api/notifications/types
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of notification types
 */
export const getNotificationTypes = async (req, res) => {
  const types = await NotificationType.find();
  res.json(types);
};

/**
 * Retrieves global notification settings
 * @route GET /api/notifications/settings
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of notification settings
 */
export const getNotificationSettings = async (req, res) => {
  const settings = await NotificationSetting.find();
  res.json(settings);
};

/**
 * Updates global notification settings for an event
 * @route PUT /api/notifications/settings
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.event - Event name to update settings for
 * @param {boolean} [req.body.enabled] - Whether the notification is enabled
 * @param {Object} [req.body.channels] - Channel-specific settings
 * @param {string[]} [req.body.notifyRoles] - Roles that should receive this notification
 * @param {Object} res - Express response object
 * @returns {Object} Updated notification settings
 * @example
 * // Request body example
 * {
 *   event: 'new_ticket',
 *   enabled: true,
 *   channels: { email: true, push: true },
 *   notifyRoles: ['admin', 'support']
 * }
 */
export const updateNotificationSettings = async (req, res) => {
  const { event, enabled, channels, notifyRoles } = req.body;

  const existing = await NotificationSetting.findOne({ event });

  let mergedChannels = existing?.channels || {};

  if (channels) {
    mergedChannels = {
      ...mergedChannels,
      ...channels, // override only changed fields
    };
    mergedChannels = JSON.parse(JSON.stringify(mergedChannels)); // remove undefined
  }

  const updateObj = {};
  if (enabled !== undefined) updateObj.enabled = enabled;
  if (channels) updateObj.channels = mergedChannels;
  if (notifyRoles) updateObj.notifyRoles = notifyRoles;

  const updated = await NotificationSetting.findOneAndUpdate(
    { event },
    updateObj,
    { new: true, upsert: true }
  );

  res.json(updated);
};

/**
 * Retrieves settings for a specific notification event
 * @route GET /api/notifications/settings/:event
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.event - Event name
 * @param {Object} res - Express response object
 * @returns {Object} Notification settings for the specified event
 */
export const getEventSetting = async (req, res) => {
  const { event } = req.params;
  const setting = await NotificationSetting.findOne({ event });
  res.json(setting);
};

/**
 * Updates the template for a specific notification event
 * @route PUT /api/notifications/templates/:event
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.event - Event name
 * @param {Object} req.body - Template data
 * @param {string} req.body.subject - Email subject
 * @param {string} req.body.body - Email/notification body
 * @param {Object} res - Express response object
 * @returns {Object} Updated template
 */
export const updateTemplate = async (req, res) => {
  const { event } = req.params;
  const { titleTemplate, bodyTemplate } = req.body;

  const updated = await NotificationTemplate.findOneAndUpdate(
    { event },
    { titleTemplate, bodyTemplate },
    { new: true, upsert: true }
  );

  res.json(updated);
};

/**
 * Retrieves the template for a specific notification event
 * @route GET /api/notifications/templates/:event
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.event - Event name
 * @param {Object} res - Express response object
 * @returns {Object} Template for the specified event
 */
export const getTemplate = async (req, res) => {
  const { event } = req.params;
  const tpl = await NotificationTemplate.findOne({ event });
  res.json(tpl);
};

// /*-----------------------------------
//   7. SEND TEST NOTIFICATION
// -----------------------------------*/
// export const sendTestNotification = async (req, res) => {
//     console.log(" TEST ROUTE HIT");
//     console.log("Method:", req.method);
//     console.log("Body:", req.body);
//   const { uid, title, body, event } = req.body;

//   // Get user tokens
//   const tokens = await NotificationToken.find({ uid });
//   const tokenList = tokens.map(t => t.token);

//   if (!tokenList.length) {
//     return res.status(404).json({ msg: "No tokens found for this user" });
//   }

//   const result = await sendNotificationUtil({
//     event,
//     payload: { title, body },
//     target: { tokens: tokenList }
//   });

//   res.json(result);
// };

/**
 * Retrieves notification logs with optional filters
 * @route GET /api/notifications/logs
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} [req.query.event] - Filter by event type (optional)
 * @param {string} [req.query.recipient] - Filter by recipient (optional)
 * @param {string} [req.query.status] - Filter by status (optional)
 * @param {string} [req.query.startDate] - Start date for filtering (ISO format)
 * @param {string} [req.query.endDate] - End date for filtering (ISO format)
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=20] - Number of items per page
 * @param {Object} res - Express response object
 * @returns {Object} Paginated list of notification logs
 */
export const getNotificationLogs = async (req, res) => {
  try {
    const { event, role, status, startDate, endDate } = req.query;

    const filters = {};

    if (event) filters.event = event;
    if (role) filters.role = role;

    // For status (success | partial | failed)
    if (status) {
      if (status === "success") filters.failureCount = 0;
      else if (status === "failed") filters.successCount = 0;
      else if (status === "partial") {
        filters.successCount = { $gt: 0 };
        filters.failureCount = { $gt: 0 };
      }
    }

    // DATE RANGE FILTER
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await NotificationLog.find(filters).sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};
