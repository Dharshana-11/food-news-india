import mongoose from "mongoose";
import ROLES from "../utils/constants/roles.js";

/**
 * KYCProfile Schema
 * -----------------------------------------------------------------------------
 * Stores KYC status and verification metadata for a user.
 * One-to-one mapping with User (unique userId).
 * Used for tracking KYC progress, verification, and rejection details.
 * -----------------------------------------------------------------------------
 */
const KYCProfileSchema = new mongoose.Schema(
  {
    /**
     * Reference to the user whose KYC this profile belongs to
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Role of the user at the time of KYC (business_owner, agent, etc.)
     */
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },

    /**
     * Current KYC status
     */
    kycStatus: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    /**
     * KYC completion percentage (0–100)
     */
    kycProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /**
     * Timestamp when KYC was verified
     */
    verifiedAt: {
      type: Date,
    },

    /**
     * Admin user who verified the KYC
     */
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    /**
     * Reason for KYC rejection (if applicable)
     */
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("KYCProfile", KYCProfileSchema);
