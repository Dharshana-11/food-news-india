import mongoose from "mongoose";

const complianceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * FUTURE RULE ENGINE
     * Example:
     *   businessType == 'RESTAURANT'
     *   employeeCount > 10
     */
    ruleExpression: {
      type: String,
      default: "",
    },

    /**
     * Validity for compliance documents (days)
     * Example:
     *   FSSAI = 365
     *   GST = 365
     *
     * KYC Documents do NOT use this field.
     */
    validityDays: {
      type: Number,
      required: true,
      min: 1, // at least 1 day
    },

    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceItem", complianceItemSchema);
