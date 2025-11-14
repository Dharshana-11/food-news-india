import mongoose from "mongoose";
import ROLES from "../utils/constants/roles.js";

const KYCDocumentSchema = new mongoose.Schema(
  {
    // Basic fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Which roles this KYC applies to
    applicableRoles: [
      {
        type: [String],
        enum: Object.values(ROLES),
        required: true,
      },
    ],

    // Status field (active / inactive / trash)
    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
    },

    // Audit fields
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
    timestamps: true, 
  }
);

// Auto-update updatedAt before save
KYCDocumentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("KYCDocument", KYCDocumentSchema);
