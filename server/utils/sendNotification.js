// utils/sendNotification.js
import { messaging } from "../firebase/firebase.js";
import NotificationLog from "../models/NotificationLog.js";
import NotificationTemplate from "../models/NotificationTemplate.js";
import NotificationToken from "../models/NotificationToken.js";
import NotificationSetting from "../models/NotificationSetting.js";
import NotificationType from "../models/NotificationType.js";
import User from "../models/User.js";
import sendEmail from "./sendEmail.js";
import { renderTemplate } from "./template.js";

/**
 * Sends a notification based on event type, payload, target, and channel rules.
 *
 *  Features:
 * - Fetches notification settings and types with fallback logic.
 * - Resolves templates dynamically using `renderTemplate()`.
 * - Determines eligible users via UID, role groups, or direct tokens.
 * - Sends push notifications via FCM multicast.
 * - Sends email notifications when enabled.
 * - Logs every notification attempt (`NotificationLog`) including failures.
 *
 *  Channel fallback priority:
 * ```txt
 * Explicit channels → NotificationSetting → NotificationType → Push Only
 * ```
 *
 * @async
 * @function sendNotification
 * @param {Object} params - Notification parameters.
 * @param {string} params.event - Unique notification event name (`ticket_created`, `user_verified`, etc.).
 * @param {Object} [params.payload={}] - Dynamic values used inside templates (e.g., ticketId, username).
 * @param {Object} [params.target={}] - Targeting options.
 * @param {string} [params.target.uid] - Target specific user by UID.
 * @param {string[]} [params.target.roles] - Target multiple users by roles (e.g. ["admin", "agent"]).
 * @param {string[]} [params.target.tokens] - Custom FCM tokens (bypass DB lookup).
 * @param {string[]} [params.channels] - Force channels (e.g. ["push", "email"]).
 *
 * @returns {Promise<{successCount:number, failureCount:number, rawResponse:Object}>}
 * Counts and raw response from FCM, plus error tracking if email or push fails.
 *
 * @throws Logs error to DB and re-throws exception on fatal errors.
 *
 * @example
 * // Send a push + email to a specific user
 * await sendNotification({
 *   event: "ticket_created",
 *   payload: { ticketId: "T123" },
 *   target: { uid: "abc123" }
 * });
 *
 * @example
 * // Send to roles only with overridden channels
 * await sendNotification({
 *   event: "user_verified",
 *   target: { roles: ["admin"] },
 *   channels: ["email"]
 * });
 */
const sendNotification = async ({
  event,
  payload = {},
  target = {},
  channels = [],
}) => {
  try {
    /* ------------------ 1) SETTINGS + TYPE FALLBACK ------------------- */
    const setting = await NotificationSetting.findOne({ event });
    const type = await NotificationType.findOne({ event });

    let resolvedChannels = {};

    if (channels.length > 0) {
      resolvedChannels = channels.reduce((a, c) => ({ ...a, [c]: true }), {});
    } else if (setting?.channels) {
      resolvedChannels = setting.channels;
    } else if (type?.defaultChannels) {
      resolvedChannels = type.defaultChannels;
    } else {
      resolvedChannels = { push: true };
    }

    const enabledChannels = Object.keys(resolvedChannels).filter(
      (key) => resolvedChannels[key] === true
    );

    /* ------------------ 2) TEMPLATE LOAD ------------------- */
    const tpl = await NotificationTemplate.findOne({ event });

    const title = renderTemplate(
      tpl?.titleTemplate || `Notification: ${event}`,
      payload
    );
    const body = renderTemplate(
      tpl?.bodyTemplate || JSON.stringify(payload),
      payload
    );

    /* ------------------ 3) RESOLVE TOKENS ------------------- */
    let finalRoles = target.roles;

    if (!finalRoles && setting?.notifyRoles?.length > 0) {
      finalRoles = setting.notifyRoles;
    }

    let tokens = [];

    if (target.uid) {
      const docs = await NotificationToken.find({ uid: target.uid });
      tokens = docs.map((d) => d.token);
    } else if (finalRoles) {
      const docs = await NotificationToken.find({ role: { $in: finalRoles } });
      tokens = docs.map((d) => d.token);
    } else if (target.tokens) {
      tokens = target.tokens;
    }

    /* ------------------ 4) SEND FCM USING MULTICAST ------------------- */
    let successCount = 0;
    let failureCount = 0;
    let rawResponse = null;

    if (enabledChannels.includes("push")) {
      if (tokens.length > 0) {
        try {
          const resp = await messaging.sendEachForMulticast({
            tokens,
            notification: { title, body },
            data: {
              event,
              channels: enabledChannels.join(","),
              ...payload,
            },
          });

          successCount = resp.successCount;
          failureCount = resp.failureCount;
          rawResponse = resp;
        } catch (err) {
          successCount = 0;
          failureCount = tokens.length;
          rawResponse = { error: err.message };
        }
      } else {
        successCount = 0;
        failureCount = 1;
        rawResponse = { error: "No tokens found for target" };
      }
    }

    // ------------------ 4B) SEND EMAIL -------------------
    if (enabledChannels.includes("email")) {
      try {
        let emails = [];

        if (target.uid) {
          const user = await User.findOne({ uid: target.uid });
          if (user?.email) emails.push(user.email);
        } else if (finalRoles) {
          const users = await User.find({ role: { $in: finalRoles } });
          emails = users.map((u) => u.email).filter(Boolean);
        }

        for (const email of emails) {
          await sendEmail({
            to: email,
            subject: title,
            html: `
              <div style="font-family: Arial">
                <h2>${title}</h2>
                <p>${body}</p>
                <hr>
                <small>This is an automated notification.</small>
              </div>
              `,
          });
        }
      } catch (err) {
        console.error("❌ Email sending failed:", err);
      }
    }

    /* ------------------ 5) LOG INTO DB ------------------- */
    await NotificationLog.create({
      event,
      uid: target.uid || null,
      role: finalRoles?.join(",") || "-",
      tokens,
      channel: enabledChannels.join(", "),
      title,
      body,
      successCount,
      failureCount,
      rawResponse,
    });

    return { successCount, failureCount, rawResponse };
  } catch (err) {
    console.error("❌ ERROR IN sendNotification:", err);

    await NotificationLog.create({
      event,
      uid: target.uid || null,
      tokens: target.tokens || [],
      channel: "push",
      title: payload.title,
      body: payload.body,
      successCount: 0,
      failureCount: 1,
      rawResponse: { error: err.message },
    });

    throw err;
  }
};

export default sendNotification;
