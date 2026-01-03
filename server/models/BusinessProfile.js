import mongoose from "mongoose";

/**
 * BusinessProfile
 * ------------------------------------------------------------------
 * Stores business-owner–specific profile information.
 * DOES NOT contain KYC status or verification state.
 * KYC state is handled by KYCProfile.
 * ------------------------------------------------------------------
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
      select: false,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BusinessProfile", businessProfileSchema);
