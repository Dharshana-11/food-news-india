import mongoose from "mongoose";

/**
 * ServiceBooking Schema
 * -----------------------------------------------------------------------------
 * Represents a compliance service booking created by a Business Owner
 * and fulfilled by a Service Provider.
 *
 * Tracks pricing, lifecycle status, documents, progress timeline,
 * and post-completion customer feedback.
 *
 * @typedef {Object} ServiceBooking
 * @property {string} bookingId - Human-readable unique booking identifier
 * @property {mongoose.Types.ObjectId} businessOwnerId - User who booked the service
 * @property {mongoose.Types.ObjectId} complianceItemId - Compliance item being serviced
 * @property {mongoose.Types.ObjectId} providerId - Assigned service provider
 * @property {number} agreedPrice - Final agreed service price
 * @property {number} estimatedDays - Estimated completion time in days
 * @property {string} status - Current booking lifecycle status
 * @property {Date} bookedAt - Booking creation timestamp
 * @property {Date} expectedCompletionDate - Estimated completion date
 * @property {Date|null} actualCompletionDate - Actual completion date
 * @property {Array<Object>} timeline - Progress updates
 * @property {Array<Object>} documents - Uploaded documents
 * @property {Object} rating - Customer feedback after completion
 * @property {string} cancellationReason - Reason for cancellation or rejection
 * @property {string} notes - Internal or user notes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const serviceBookingSchema = new mongoose.Schema(
  {
    /**
     * Public booking identifier
     */
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Business owner who created the booking
     */
    businessOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    /**
     * Compliance item being serviced
     * (e.g., FSSAI License, GST Registration, Trade License)
     */
    complianceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceItem",
      required: true,
      index: true,
    },

    /**
     * Assigned service provider
     */
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

    /**
     * Booking lifecycle status
     */
    status: {
      type: String,
      enum: [
        "pending", // Booking created
        "accepted", // Provider accepted
        "in_progress", // Work started
        "documents_submitted", // Awaiting review
        "completed", // Successfully completed
        "cancelled", // Cancelled by business owner
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

    /**
     * Progress tracking timeline
     */
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

    /**
     * Uploaded documents (certificates, licenses, etc.)
     */
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

    /**
     * Customer rating after completion
     */
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

    /**
     * Cancellation / rejection context
     */
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

/**
 * Auto-generate bookingId if not provided
 */
serviceBookingSchema.pre("validate", function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

/**
 * Query optimization indexes
 */
serviceBookingSchema.index({ businessOwnerId: 1, status: 1, bookedAt: -1 });
serviceBookingSchema.index({ providerId: 1, status: 1, bookedAt: -1 });
serviceBookingSchema.index({ status: 1, bookedAt: -1 });
serviceBookingSchema.index({ createdBy: 1, bookedAt: -1 });

export default mongoose.model("ServiceBooking", serviceBookingSchema);
