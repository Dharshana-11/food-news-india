/**
 * BusinessAgentRelation.js
 * ============================================================================
 * Maps business owners to their assigned agents
 * Tracks permissions, status, activity logs, and commission details
 */

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "document_uploaded",
        "application_submitted",
        "renewal_requested",
        "profile_updated",
        "compliance_checked",
        "comment_added",
        "status_changed",
      ],
    },
    description: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Extra data like document names, IDs, etc.
      default: {},
    },
  },
  { _id: true }
);

const businessAgentRelationSchema = new mongoose.Schema(
  {
    businessOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    // Relationship Status
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "removed"],
      default: "pending",
      index: true,
    },

    pendingExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },

    // Permissions granted to agent
    permissions: {
      canUploadDocuments: { type: Boolean, default: true },
      canSubmitApplications: { type: Boolean, default: true },
      canViewDashboard: { type: Boolean, default: true },
      canReceiveUpdates: { type: Boolean, default: true },
    },

    // Commission Details
    agreedCommission: {
      type: Number, // ₹ per month
      required: true,
      immutable: true,
    },

    paymentFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
    },

    // Dates
    invitedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    removedAt: {
      type: Date,
      default: null,
    },

    // Activity Log
    activityLog: [activitySchema],

    // Notes
    businessOwnerNotes: {
      type: String,
      maxlength: 1000,
      default: "",
    },

    agentNotes: {
      type: String,
      maxlength: 1000,
      default: "",
    },

    // Rejection/Removal Reason
    reasonForRejection: {
      type: String,
      default: "",
    },

    reasonForRemoval: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound indexes
businessAgentRelationSchema.index({ businessOwnerId: 1, status: 1 });
businessAgentRelationSchema.index({ agentId: 1, status: 1 });

// Prevent duplicate active relations
businessAgentRelationSchema.index(
  { businessOwnerId: 1, agentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "active"] } }, // only active and pending agents are unique
  }
);

// Optional: pending invite expiry field
businessAgentRelationSchema.add({
  pendingExpiresAt: { type: Date, default: null },
});

// Helper method to check if a pending invite is still valid
businessAgentRelationSchema.methods.isPendingActive = function () {
  if (this.status !== "pending") return false;
  if (!this.pendingExpiresAt) return true; // no expiry set
  return this.pendingExpiresAt > new Date();
};

export default mongoose.model(
  "BusinessAgentRelation",
  businessAgentRelationSchema
);
