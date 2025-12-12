// Initializes Firebase Admin SDK with service account credentials.
// Provides backend access to verify users, manage Firebase data, and send FCM notifications.

import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

//const serviceAccountKey = JSON.parse(process.env.FIREBASE_KEY_PATH); //Parses JSON & loads the service account key

// Get absolute path to your key file
const serviceAccountPath = path.resolve(process.env.FIREBASE_KEY_PATH);

// Read and parse the JSON key
const serviceAccountKey = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8"),
);

const firebaseAdmin = admin.initializeApp({
  //starts the firebase admin in server
  credential: admin.credential.cert(serviceAccountKey), //Verifies key and creates a credential obj that can be used for verification of tokens etc.
});

export const messaging = getMessaging(firebaseAdmin);

export default firebaseAdmin;
