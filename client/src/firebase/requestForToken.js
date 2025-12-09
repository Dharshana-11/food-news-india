/**
 * Requests browser notification permission and retrieves a Firebase Cloud Messaging (FCM) token.
 *
 * This function:
 * 1. Prompts the user for notification permission.
 * 2. If granted, it attempts to fetch the device's FCM registration token using `getToken`.
 * 3. Returns the FCM token if successful, otherwise returns `null`.
 *
 * @async
 * @function requestForToken
 * @returns {Promise<string|null>} Resolves with a valid FCM token string when permission is granted,
 *                                or `null` if permission is denied or an error occurs.
 *
 * @example
 * requestForToken().then(token => {
 *   if (token) {
 *     console.log("Notification token fetched:", token);
 *   } else {
 *     console.log("Permission denied or token unavailable.");
 *   }
 * });
 */
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};
