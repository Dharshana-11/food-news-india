// server/firebase.js
/**
 * Initializes Firebase Admin SDK with service account credentials.
 * Provides backend access to verify users, manage Firebase data, and send FCM notifications.
 */

import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Get absolute path to the Firebase service account JSON key
const serviceAccountPath = path.resolve(process.env.FIREBASE_KEY_PATH);

// Read and parse the JSON key
const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey), // Credential object for token verification, user management, etc.
});

export default firebaseAdmin;
