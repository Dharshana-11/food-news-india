import mongoose from "mongoose";

/**
 * @typedef {Object} ComplianceItem
 * @property {string} name - Name of the compliance item (e.g., "FSSAI License").
 * @property {string} code - Unique short code for the compliance item (e.g., "FSSAI").
 * @property {string} description - Detailed description of the compliance requirement.
 * @property {string} ruleExpression - (Future Use) Rule expression for dynamic compliance logic.
 * @property {number} validityDays - Validity duration (in days) of the compliance document.
 * @property {"active"|"inactive"|"trash"} status - Status of the compliance item.
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last updated.
 */

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
     * FUTURE: RULE ENGINE SUPPORT
     * Example:
     *   businessType == "RESTAURANT"
     *   employeeCount > 10
     */
    ruleExpression: {
      type: String,
      default: "",
    },

    /**
     * Validity period for compliance documents (in days).
     * Example:
     *   FSSAI = 365
     *   GST = 365
     *
     * NOTE:
     *   Some KYC documents do NOT use validity.
     */
    validityDays: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ComplianceItem", complianceItemSchema);
