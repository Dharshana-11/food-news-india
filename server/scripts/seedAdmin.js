// server/firebase.js

/**
 * Initializes Firebase Admin SDK for backend services.
 *
 * 📌 Provides:
 * - Secure user authentication (verify ID tokens)
 * - Access to Firestore / Firebase Auth management
 * - Ability to send Firebase Cloud Messaging (FCM) push notifications
 *
 * 🔐 Uses a private service account JSON file whose path is stored in
 * `process.env.FIREBASE_KEY_PATH` for security.
 *
 * @module FirebaseAdmin
 * @requires firebase-admin
 * @requires dotenv
 * @requires fs
 * @requires path
 *
 * @example
 * // Example usage:
 * import firebaseAdmin from "./firebase.js";
 * const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
 */

import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Get absolute path to the Firebase service account JSON key
const serviceAccountPath = path.resolve(process.env.FIREBASE_KEY_PATH);

// Read and parse the JSON key
const serviceAccountKey = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8"),
);

// Initialize Firebase Admin SDK
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey), // Credential object for token verification, user management, etc.
});

export default firebaseAdmin;
