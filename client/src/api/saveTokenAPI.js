/**
 * @file saveTokenAPI.js
 * @description API utility for saving a device's FCM token to the server
 * @module api/saveTokenAPI
 * @version 1.0.0
 * @example
 * import saveTokenAPI from './api/saveTokenAPI';
 * 
 * // Save token when user logs in or token refreshes
 * await saveTokenAPI({
 *   uid: 'user-123',
 *   token: 'fcm-token-abc123',
 *   role: 'admin'
 * });
 */

/**
 * Saves a device's FCM token to the server for push notifications
 * @async
 * @function saveTokenAPI
 * @param {Object} payload - The token data to save
 * @param {string} payload.uid - The unique identifier of the user
 * @param {string} payload.token - The FCM token to be saved
 * @param {string} payload.role - The user's role (e.g., 'admin', 'user')
 * @returns {Promise<void>} Resolves when the token is successfully saved
 * @throws {Error} If the request fails or the response is not OK
 * @example
 * // Basic usage
 * await saveTokenAPI({
 *   uid: 'user-123',
 *   token: 'fcm-token-abc123',
 *   role: 'admin'
 * });
 * 
 * // With error handling
 * try {
 *   await saveTokenAPI(payload);
 *   console.log('Token saved successfully');
 * } catch (error) {
 *   console.error('Failed to save token:', error);
 * }
 */
export default async function saveTokenAPI(payload) {
  const response = await fetch("http://localhost:5000/api/notifications/save-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to save token: ${response.status} ${response.statusText}`);
  }
}
