import mongoose from "mongoose";

const ComplianceRequirementMappingSchema = new mongoose.Schema(
  {
    businessTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessType",
      required: [true, "businessTypeId is required"],
      index: true,
    },

    complianceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceItem",
      required: [true, "complianceItemId is required"],
      index: true,
    },

    applicability: {
      type: String,
      enum: ["required", "optional", "not_applicable"],
      default: "required",
      required: true,
    },

    // status replaces boolean soft-delete. Use "trash" when deleted.
    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
      required: true,
    },

    // optional fields for ordering / metadata
    sortOrder: { type: Number, default: 0 },

    // Audit fields (optional: populate from controllers)
    createdBy: { type: String, default: "system" },
    updatedBy: { type: String, default: "system" },

    // any future metadata
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

/**
 * Compound unique index to avoid duplicate mapping for same businessType + complianceItem
 * Note: If you need to allow multiple mappings (e.g. variants), remove/change this.
 */
ComplianceRequirementMappingSchema.index(
  { businessTypeId: 1, complianceItemId: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "trash" } } }
);

/**
 * Query helper: .notTrash() to exclude trashed records easily from controllers
 * Example: Model.find().notTrash().populate(...)
 */
ComplianceRequirementMappingSchema.query.notTrash = function () {
  return this.where({ status: { $ne: "trash" } });
};

export default mongoose.model("ComplianceRequirementMapping", ComplianceRequirementMappingSchema);
