/**
 * @file Ticket Model
 * @description Defines the schema and model for tickets and ticket messages
 * @module models/Ticket
 */

import mongoose from "mongoose";

/**
 * @typedef Message
 * @property {string} senderId - ID of the message sender
 * @property {string} senderRole - Role of the message sender
 * @property {string} message - The message content
 * @property {Date} timestamp - When the message was sent
 */

/**
 * Message subdocument schema for ticket conversations
 * @type {mongoose.Schema}
 */
const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderRole: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

/**
 * @typedef Ticket
 * @property {string} ticketId - Unique identifier for the ticket (auto-generated)
 * @property {Object} createdBy - Information about the ticket creator
 * @property {string} createdBy.userId - ID of the user who created the ticket
 * @property {string} createdBy.name - Name of the user who created the ticket
 * @property {string} createdBy.role - Role of the user who created the ticket
 * @property {string} category - Category of the ticket (e.g., 'Technical', 'Billing')
 * @property {string} [priority='Medium'] - Priority level (e.g., 'Low', 'Medium', 'High')
 * @property {string} [status='New'] - Current status of the ticket
 * @property {string} description - Detailed description of the issue
 * @property {string[]} [attachments=[]] - Array of attachment URLs
 * @property {Message[]} [messages=[]] - Array of message objects in the ticket conversation
 * @property {Date} [sla] - Service Level Agreement deadline
 * @property {boolean} [isDeleted=false] - Soft delete flag
 * @property {Date} [createdAt] - When the ticket was created
 * @property {Date} [updatedAt] - When the ticket was last updated
 */

/**
 * Ticket schema definition
 * @type {mongoose.Schema}
 */
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },

  createdBy: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },

  category: { type: String, required: true },
  priority: { type: String, default: "Medium" },
  status: { type: String, default: "New" },

  description: { type: String, required: true },

  attachments: { type: [String], default: [] },
  messages: { type: [messageSchema], default: [] },

  sla: { type: Date },

  isDeleted: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create and export the Ticket model
const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
