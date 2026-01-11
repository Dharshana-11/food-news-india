import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ServiceProviderService
 * ------------------------------------------------------------------
 * Represents a SINGLE service offering by a service provider
 * for a specific compliance item.
 *
 * This is what admin APPROVES or REJECTS.
 *
 * Example:
 *   Provider A → FSSAI License → APPROVED
 */

const serviceProviderServiceSchema = new Schema(
  {
    /**
     * The service provider offering this service
     */
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true,
    },

    /**
     * The compliance item this service is for
     */
    complianceItemId: {
      type: Schema.Types.ObjectId,
      ref: "ComplianceItem",
      required: true,
      index: true,
    },

    /**
     * Optional service-specific details
     */
    price: {
      type: Number,
      min: 0,
      default: null,
    },

    turnaroundDays: {
      type: Number,
      min: 1,
      default: null,
    },

    /**
     * ADMIN decision on this service
     */
    status: {
      type: String,
      enum: [
        "draft", // provider added but not submitted
        "pending_approval", // submitted, waiting for admin
        "approved", // admin approved
        "rejected", // admin rejected
        "inactive", // disabled later
      ],
      default: "draft",
      index: true,
    },

    /**
     * Notes from admin (rejection reason, remarks, etc.)
     */
    adminNotes: {
      type: String,
      default: "",
    },

    /**
     * Timestamp when admin approved/rejected
     */
    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * A provider should not create duplicate services
 * for the same compliance item
 */
serviceProviderServiceSchema.index(
  { serviceProviderId: 1, complianceItemId: 1 },
  { unique: true }
);

export default mongoose.model(
  "ServiceProviderService",
  serviceProviderServiceSchema
);
