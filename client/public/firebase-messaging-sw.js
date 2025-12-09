/**
 * Service Worker for Firebase Cloud Messaging (FCM)
 *
 * Loads Firebase libraries for handling background push notifications.
 * This file is executed in the Service Worker context and not in the main window.
 */

importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

/**
 * Initializes the Firebase app in the Service Worker using the provided configuration.
 *
 * @constant
 * @type {Object}
 */
firebase.initializeApp({
  apiKey: "AIzaSyCoFdPGAl9sq0-5odX4Y1NbFZP5peFErpc",
  authDomain: "food-news-india.firebaseapp.com",
  projectId: "food-news-india",
  storageBucket: "food-news-india.firebasestorage.app",
  messagingSenderId: "127532475245",
  appId: "1:127532475245:web:594a790bc95affc9ac3064",
});

/**
 * Messaging instance for handling background notifications.
 *
 * @constant
 * @type {firebase.messaging.Messaging}
 */
const messaging = firebase.messaging();

/**
 * Handles incoming background messages from Firebase Cloud Messaging.
 * Displays desktop notifications when the application is not in focus.
 *
 * @param {Object} payload - The notification payload received from FCM.
 * @param {Object} payload.notification - Notification data sent from the server.
 * @param {string} payload.notification.title - Title text of the notification.
 * @param {string} payload.notification.body - Body text of the notification.
 */
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
