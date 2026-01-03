import mongoose from "mongoose";
import ROLES from "../utils/constants/roles.js";

const KYCProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },

    kycStatus: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    kycProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    verifiedAt: Date,

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // admin user
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("KYCProfile", KYCProfileSchema);
