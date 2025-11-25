import mongoose from "mongoose";

/**
 * @typedef {Object} ComplianceRequirementMapping
 * @property {mongoose.Types.ObjectId} businessTypeId - Reference to the BusinessType.
 * @property {mongoose.Types.ObjectId} complianceItemId - Reference to the ComplianceItem.
 * @property {"required"|"optional"|"not_applicable"} applicability - Determines requirement level.
 * @property {"active"|"inactive"|"trash"} status - Soft-delete & status tracking.
 * @property {number} sortOrder - Ordering for UI or grouping.
 * @property {string} createdBy - User ID or identifier that created the mapping.
 * @property {string} updatedBy - User ID or identifier that last updated the mapping.
 * @property {Object} meta - Additional metadata for future extensibility.
 * @property {Date} createdAt - Timestamp added by Mongoose.
 * @property {Date} updatedAt - Timestamp updated automatically by Mongoose.
 */
const ComplianceRequirementMappingSchema = new mongoose.Schema(
  {
    /**
     * Reference to the Business Type
     */
    businessTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessType",
      required: [true, "businessTypeId is required"],
      index: true,
    },

    /**
     * Reference to the Compliance Item
     */
    complianceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceItem",
      required: [true, "complianceItemId is required"],
      index: true,
    },

    /**
     * Whether the compliance requirement is mandatory or optional
     */
    applicability: {
      type: String,
      enum: ["required", "optional", "not_applicable"],
      default: "required",
      required: true,
    },

    /**
     * Soft delete & lifecycle state
     * active → visible
     * inactive → temporarily disabled
     * trash → soft-deleted (hidden)
     */
    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
      required: true,
    },

    /**
     * Optional UI ordering
     */
    sortOrder: { type: Number, default: 0 },

    /**
     * Audit fields (set in controllers)
     */
    createdBy: { type: String, default: "system" },
    updatedBy: { type: String, default: "system" },

    /**
     * Flexible metadata container
     */
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true, // adds `createdAt` and `updatedAt`
  },
);

/**
 * Compound unique index to prevent duplicate mapping for the same pair.
 * Excludes records that are soft-deleted (status="trash").
 */
ComplianceRequirementMappingSchema.index(
  { businessTypeId: 1, complianceItemId: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "trash" } } },
);

/**
 * Query helper to exclude trashed records.
 * Usage: Model.find().notTrash()
 */
ComplianceRequirementMappingSchema.query.notTrash = function () {
  return this.where({ status: { $ne: "trash" } });
};

export default mongoose.model(
  "ComplianceRequirementMapping",
  ComplianceRequirementMappingSchema,
);
