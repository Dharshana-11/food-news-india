import mongoose from "mongoose";

/**
 * @typedef {Object} ServiceProviderRequirement
 * @property {string} name - Display name of the required document
 * @property {string} description - Helper text explaining why it is required
 * @property {boolean} required - Whether this document is mandatory
 * @property {string[]} allowedFileTypes - Allowed file types (e.g., pdf, jpg, png)
 */

const serviceProviderRequirementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    required: {
      type: Boolean,
      default: true,
    },

    allowedFileTypes: {
      type: [String],
      default: ["pdf", "jpg", "jpeg", "png"],
    },
  },
  { _id: false }
);

/**
 * @typedef {Object} ComplianceItem
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
     */
    ruleExpression: {
      type: String,
      default: "",
    },

    /**
     * Validity period for compliance documents (in days).
     */
    validityDays: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * Documents required for a Service Provider
     * to be AUTHORIZED to offer this compliance as a service.
     *
     * NOTE:
     * - These are definitions, not uploaded files
     * - Actual documents will be stored in Document collection
     */
    serviceProviderRequirements: {
      type: [serviceProviderRequirementSchema],
      default: [],
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
