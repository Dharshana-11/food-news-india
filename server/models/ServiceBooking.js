import mongoose from "mongoose";

/**
 * @typedef {Object} ServiceBooking
 * @property {string} bookingId - Unique booking identifier
 * @property {mongoose.Types.ObjectId} businessOwnerId - Who booked the service
 * @property {mongoose.Types.ObjectId} complianceItemId - ComplianceItem being serviced
 * @property {mongoose.Types.ObjectId} providerId - ServiceProvider fulfilling it
 * @property {number} agreedPrice - Final agreed price
 * @property {string} status - Current booking status
 * @property {Date} bookedAt - When booking was created
 * @property {Date} expectedCompletionDate - Estimated completion
 * @property {Date} actualCompletionDate - When it was actually completed
 * @property {Object[]} timeline - Progress tracking
 * @property {Object[]} documents - Uploaded documents
 * @property {Object} rating - Customer rating after completion
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const serviceBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    businessOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    /**
     * Reference to ComplianceItem instead of Service
     * E.g., FSSAI License, Trade License, GST Registration
     */
    complianceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceItem",
      required: true,
      index: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true,
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDays: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "pending", // Just created
        "accepted", // Provider accepted
        "in_progress", // Work started
        "documents_submitted", // Awaiting review
        "completed", // Successfully completed
        "cancelled", // Cancelled by user
        "rejected", // Rejected by provider
      ],
      default: "pending",
      index: true,
    },

    bookedAt: {
      type: Date,
      default: Date.now,
    },

    expectedCompletionDate: {
      type: Date,
      required: true,
    },

    actualCompletionDate: {
      type: Date,
      default: null,
    },

    // Progress tracking
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
      },
    ],

    // Document management (certificates, licenses, etc.)
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Customer rating (after completion)
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      ratedAt: {
        type: Date,
      },
    },

    // Cancellation/rejection reason
    cancellationReason: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique booking ID
serviceBookingSchema.pre("validate", function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Compound indexes for queries
serviceBookingSchema.index({ businessOwnerId: 1, status: 1, bookedAt: -1 });
serviceBookingSchema.index({ providerId: 1, status: 1, bookedAt: -1 });
serviceBookingSchema.index({ status: 1, bookedAt: -1 });

export default mongoose.model("ServiceBooking", serviceBookingSchema);
