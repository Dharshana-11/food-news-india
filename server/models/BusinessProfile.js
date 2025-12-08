import mongoose from "mongoose";

/**
 * @typedef {Object} BusinessProfile
 * @property {mongoose.Types.ObjectId} userId - Reference to User
 * @property {mongoose.Types.ObjectId} businessTypeId - Reference to BusinessType
 * @property {string} businessName - Name of the business
 * @property {string} registeredAddress - Business registration address
 * @property {string} [fssaiLicenseNumber] - FSSAI License Number
 * @property {Date} [fssaiValidityPeriod] - FSSAI validity end date
 * @property {string} [fssaiCategory] - FSSAI category
 * @property {string} [gstNumber] - GST Registration Number
 * @property {Date} [dateOfBirth] - Owner's date of birth
 * @property {string} [aadhaarNumber] - Aadhaar card number (encrypted)
 * @property {string} [panNumber] - PAN card number
 * @property {"pending"|"in_review"|"verified"|"rejected"} kycStatus - Overall KYC status
 * @property {number} kycProgress - KYC completion percentage (0-100)
 * @property {Date} [verifiedAt] - When KYC was verified
 * @property {mongoose.Types.ObjectId} [verifiedBy] - Admin who verified
 * @property {string} [rejectionReason] - Reason for rejection
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    businessTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessType",
      default: null,
    },

    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    registeredAddress: {
      type: String,
      trim: true,
      default: "",
    },

    // FSSAI License details
    fssaiLicenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    fssaiValidityPeriod: {
      type: Date,
      default: null,
    },

    fssaiCategory: {
      type: String,
      trim: true,
      default: "",
    },

    // GST details
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    // Personal details
    dateOfBirth: {
      type: Date,
      default: null,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
      default: "",
      select: false, // Don't return in queries by default
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    // KYC Status tracking
    kycStatus: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    kycProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Index for faster queries
businessProfileSchema.index({ kycStatus: 1, createdAt: -1 });

export default mongoose.model("BusinessProfile", businessProfileSchema);
