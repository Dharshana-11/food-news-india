// Initializes Firebase Admin SDK with service account credentials.
// Provides backend access to verify users, manage Firebase data, and send FCM notifications.

import admin from "firebase-admin/app";

const serviceAccountKey = JSON.parse(process.env.FIREBASE_KEY_PATH); //Parses JSON & loads the service account key

const firebaseAdmin = admin.initializeApp({ //starts the firebase admin in server
    credential: admin.credential.cert(serviceAccountKey)  //Verifies key and creates a credential obj that can be used for verification of tokens etc. 
});

export default firebaseAdmin;