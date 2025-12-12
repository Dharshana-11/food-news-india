/**
 * @file Admin Model
 * @description Defines the schema for admin users in the system with role-based access control
 * @module models/Admin
 */

import mongoose from "mongoose";

/**
 * @typedef Admin
 * @property {string} uid - Firebase UID of the admin user (must be unique)
 * @property {string} email - Admin's email address (must be unique)
 * @property {string} [role='admin'] - Admin role, either 'admin' or 'super-admin'
 * @property {string} name - Full name of the admin
 * @property {Date} [createdAt] - When the admin account was created
 * @property {Date} [updatedAt] - When the admin account was last updated
 * @example
 * {
 *   uid: 'firebase-uid-123',
 *   email: 'admin@example.com',
 *   role: 'admin',
 *   name: 'John Doe',
 *   createdAt: '2025-12-09T00:00:00.000Z',
 *   updatedAt: '2025-12-09T00:00:00.000Z'
 * }
 */

/**
 * Admin schema definition
 * @type {mongoose.Schema}
 */
const AdminSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // Ensure UID is unique in the database
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique in the database
    },
    role: {
      type: String,
      enum: ["admin", "super-admin"],
      default: "admin",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create and export the Admin model
const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
