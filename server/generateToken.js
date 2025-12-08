import firebaseAdmin from "./firebase.js"; // your admin setup

/**
 * Generates a Firebase Custom Auth Token for a given user UID.
 *
 * 🔐 A custom token is typically used for:
 * - Authenticating server-trusted users on the client
 * - Migrating users from another auth system
 * - Granting privileged access using your backend
 *
 * 📌 REQUIREMENTS:
 * - The provided UID must already exist in Firebase Authentication.
 *
 * @async
 * @function generateToken
 * @returns {Promise<void>} Logs the generated token or error to the console.
 *
 * @example
 * // Sample Usage
 * const uid = "some_existing_firebase_uid";
 * const token = await firebaseAdmin.auth().createCustomToken(uid);
 * console.log(token);
 */
async function generateToken() {
  try {
    const uid = "TXkibM39hrdK8mcHa8h1xqyrzxz2"; // replace with an existing user's UID
    const customToken = await firebaseAdmin.auth().createCustomToken(uid);
    console.log("Custom Token:", customToken);
  } catch (err) {
    console.error("Error creating custom token:", err);
  }
}

generateToken();
