/**
 * AgentProfile.js
 * ============================================================================
 * Extended profile for users with role="agent"
 * Stores agent-specific data like ratings, commission, experience, etc.
 */

import mongoose from "mongoose";

const agentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    // Professional Details
    experience: {
      type: Number, // Years of experience
      default: 0,
    },

    specialization: {
      type: [String], // e.g., ["FSSAI", "GST", "Trade License"]
      default: [],
    },

    commissionRate: {
      type: Number, // ₹ per month per business
      default: 7500,
      min: 0,
    },

    // Performance Metrics
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    businessesManaged: {
      type: Number,
      default: 0,
    },

    totalApplicationsSubmitted: {
      type: Number,
      default: 0,
    },

    totalDocumentsUploaded: {
      type: Number,
      default: 0,
    },

    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },

    maxBusinesses: {
      type: Number, // Maximum businesses they can handle
      default: 10,
    },

    // Bank Details (for commission payments)
    bankDetails: {
      accountNumber: { type: String, default: "", select: false },
      ifscCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },

    // Bio
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // Location
    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    languages: {
      type: [String], // ["English", "Hindi", "Tamil"]
      default: ["English"],
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
agentProfileSchema.index({ rating: -1 });
agentProfileSchema.index({ isAvailable: 1, businessesManaged: 1 });
agentProfileSchema.index({ city: 1, state: 1 });

export default mongoose.model("AgentProfile", agentProfileSchema);
