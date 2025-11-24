/**
 * KYC Document Schema
 * --------------------
 * Defines all KYC document requirements and their applicability
 * across different roles in the system.
 */

import mongoose from "mongoose";
import ROLES from "../utils/constants/roles.js";

const KYCDocumentSchema = new mongoose.Schema(
  {
    /**
     * Display name of the KYC Document
     * Example: "Aadhaar Card", "PAN Card"
     */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Unique code for identification
     * Example: "AADHAAR", "PAN", "GST_CERT"
     */
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    /**
     * Optional description of the KYC Document
     */
    description: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Roles for which this KYC document is applicable
     * Example: ["FBO", "AGENT"]
     */
    applicableRoles: {
      type: [String],
      enum: Object.values(ROLES),
      required: true,
    },

    /**
     * Status:
     *  - active   → visible and usable
     *  - inactive → temporarily hidden
     *  - trash    → soft deleted
     */
    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
    },

    /**
     * Audit fields
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * Auto-set updatedAt before save
 */
KYCDocumentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("KYCDocument", KYCDocumentSchema);
