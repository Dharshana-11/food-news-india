// seedNotificationTypes.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import NotificationType from "../models/NotificationType.js";

dotenv.config();

/**
 * MongoDB connection URI loaded from environment variables.
 * Exits the process if the value is missing.
 *
 * @constant {string} MONGO_URI
 */
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

/**
 * Establish MongoDB connection before seeding data.
 */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ Mongo connection failed:", err);
    process.exit(1);
  });

/**
 * List of Notification Types to be seeded into the database.
 * Each notification contains:
 *  - `event` (unique key for notification)
 *  - `label` (readable name)
 *  - `category` (group classification)
 *  - `defaultChannels` (default delivery channels settings)
 *
 * @constant {Array<Object>} NOTIFICATION_TYPES
 */
const NOTIFICATION_TYPES = [
  // --------------------- Ticket Module ---------------------
  { event: "ticket_created", label: "New Ticket Created", category: "ticket", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "ticket_updated", label: "Ticket Updated", category: "ticket", defaultChannels: { push: true, email: false, sms: false, web: true }},
  { event: "ticket_assigned", label: "Ticket Assigned", category: "ticket", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "ticket_reassigned", label: "Ticket Reassigned", category: "ticket", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "ticket_status_changed", label: "Ticket Status Changed", category: "ticket", defaultChannels: { push: true, email: false, sms: false, web: true }},
  { event: "ticket_closed", label: "Ticket Closed", category: "ticket", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "ticket_comment_added", label: "New Comment Added", category: "ticket", defaultChannels: { push: true, email: false, sms: false, web: true }},

  // --------------------- User Module ---------------------
  { event: "user_registered", label: "New User Registration", category: "user", defaultChannels: { push: false, email: true, sms: false, web: true }},
  { event: "user_verified", label: "User Verified", category: "user", defaultChannels: { push: false, email: true, sms: false, web: false }},
  { event: "role_changed", label: "User Role Updated", category: "user", defaultChannels: { push: true, email: true, sms: false, web: true }},

  // --------------------- System Alerts ---------------------
  { event: "system_health_alert", label: "System Health Alert", category: "system", defaultChannels: { push: true, email: true, sms: true, web: true }},
  { event: "storage_limit_warning", label: "Storage Limit Warning", category: "system", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "high_priority_ticket", label: "High Priority Ticket Alert", category: "system", defaultChannels: { push: true, email: true, sms: true, web: true }},

  // --------------------- Feedback Module ---------------------
  { event: "new_feedback", label: "New Feedback Received", category: "feedback", defaultChannels: { push: true, email: true, sms: false, web: true }},

  // --------------------- Compliance Module ---------------------
  { event: "document_expiring", label: "Document Expiration Reminder", category: "compliance", defaultChannels: { push: true, email: true, sms: false, web: true }},
  { event: "verification_required", label: "Verification Required", category: "compliance", defaultChannels: { push: false, email: true, sms: false, web: true }},

  // --------------------- Test Module ---------------------
  {
    event: "test_manual",
    label: "Manual Test Notification",
    category: "other",
    defaultChannels: { push: true, email: false, sms: false, web: true }
  }
];

/**
 * Seeds the NotificationType collection.
 * Uses `findOneAndUpdate` with `upsert` to prevent duplicates,
 * ensuring new items are added and existing ones are updated.
 *
 * @async
 * @function seedNotificationTypes
 * @returns {Promise<void>} Closes MongoDB connection after completion.
 */
const seedNotificationTypes = async () => {
  try {
    console.log("⏳ Seeding Notification Types...");

    for (const type of NOTIFICATION_TYPES) {
      await NotificationType.findOneAndUpdate(
        { event: type.event },  // Match by event ID
        type,                   // Insert/Update data
        { upsert: true, new: true }
      );
    }

    console.log("✅ Notification Types seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Notification Types:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedNotificationTypes();
