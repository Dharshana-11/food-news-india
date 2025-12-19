/**
 * BusinessAgentRelation Model
 * ============================================================================
 * Represents the relationship between a Business Owner and an Agent.
 * Tracks assignment status, permissions, commission details,
 * lifecycle timestamps, and activity history.
 */

import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Activity Log Schema
 * Records significant actions performed within the relationship.
 */
const activitySchema = new Schema(
  {
    /**
     * Type of action performed.
     */
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

    /**
     * Optional human-readable description of the action.
     */
    description: {
      type: String,
      default: "",
    },

    /**
     * When the action occurred.
     */
    timestamp: {
      type: Date,
      default: Date.now,
    },

    /**
     * Additional contextual data (document IDs, names, etc.).
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: true }
);

/**
 * BusinessAgentRelation Schema
 */
const businessAgentRelationSchema = new Schema(
  {
    /**
     * Business owner user reference.
     */
    businessOwnerId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    /**
     * Agent user reference.
     */
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    /* ------------------------------------------------------------------------
     * Relationship Status
     * ----------------------------------------------------------------------*/

    /**
     * Current state of the agent–business relationship.
     */
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "removed"],
      default: "pending",
      index: true,
    },

    /**
     * Expiry time for pending invitations.
     * Defaults to 7 days from invitation.
     */
    pendingExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    /* ------------------------------------------------------------------------
     * Permissions
     * ----------------------------------------------------------------------*/

    /**
     * Permissions granted to the agent by the business owner.
     */
    permissions: {
      canUploadDocuments: { type: Boolean, default: true },
      canSubmitApplications: { type: Boolean, default: true },
      canViewDashboard: { type: Boolean, default: true },
      canReceiveUpdates: { type: Boolean, default: true },
    },

    /* ------------------------------------------------------------------------
     * Commission Details
     * ----------------------------------------------------------------------*/

    /**
     * Agreed commission amount (₹ per month).
     * Immutable once relationship is created.
     */
    agreedCommission: {
      type: Number,
      required: true,
      immutable: true,
      min: 0,
    },

    /**
     * Frequency of commission payments.
     */
    paymentFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
    },

    /* ------------------------------------------------------------------------
     * Lifecycle Timestamps
     * ----------------------------------------------------------------------*/

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

    /* ------------------------------------------------------------------------
     * Activity & Notes
     * ----------------------------------------------------------------------*/

    /**
     * Chronological log of actions related to this relationship.
     */
    activityLog: [activitySchema],

    /**
     * Notes added by the business owner.
     */
    businessOwnerNotes: {
      type: String,
      maxlength: 1000,
      default: "",
      trim: true,
    },

    /**
     * Notes added by the agent.
     */
    agentNotes: {
      type: String,
      maxlength: 1000,
      default: "",
      trim: true,
    },

    /* ------------------------------------------------------------------------
     * Rejection / Removal Metadata
     * ----------------------------------------------------------------------*/

    reasonForRejection: {
      type: String,
      default: "",
      trim: true,
    },

    reasonForRemoval: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

/* --------------------------------------------------------------------------
 * Indexes
 * ------------------------------------------------------------------------*/

/**
 * Used for fetching relationships by business owner and status.
 */
businessAgentRelationSchema.index({ businessOwnerId: 1, status: 1 });

/**
 * Used for fetching relationships by agent and status.
 */
businessAgentRelationSchema.index({ agentId: 1, status: 1 });

/**
 * Prevents multiple pending/active relationships
 * between the same business owner and agent.
 */
businessAgentRelationSchema.index(
  { businessOwnerId: 1, agentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "active"] },
    },
  }
);

/* --------------------------------------------------------------------------
 * Instance Methods
 * ------------------------------------------------------------------------*/

/**
 * Checks whether a pending invitation is still valid.
 *
 * @returns {boolean} True if pending and not expired.
 */
businessAgentRelationSchema.methods.isPendingActive = function () {
  if (this.status !== "pending") return false;
  if (!this.pendingExpiresAt) return true;
  return this.pendingExpiresAt > new Date();
};

export default mongoose.model(
  "BusinessAgentRelation",
  businessAgentRelationSchema
);
