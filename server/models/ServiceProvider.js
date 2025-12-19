import mongoose from "mongoose";

/**
 * @typedef {Object} ServiceProvider
 * @property {mongoose.Types.ObjectId} userId - Reference to User (role: service_provider)
 * @property {string} companyName - Business/Company name
 * @property {string} description - About the service provider
 * @property {string} logo - Logo URL or path
 * @property {mongoose.Types.ObjectId[]} complianceItemsOffered - ComplianceItems they can help with
 * @property {string} location - City/Region
 * @property {number} rating - Average rating (0-5)
 * @property {number} totalCustomers - Number of unique customers served
 * @property {number} completedBookings - Successfully completed bookings
 * @property {Object[]} pricingPerItem - Custom pricing for each compliance item
 * @property {string} status - Account status
 * @property {Date} verifiedAt - When provider was verified
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    /**
     * ComplianceItems this provider can help with
     * E.g., ["FSSAI_LICENSE_ID", "TRADE_LICENSE_ID", "GST_REG_ID"]
     */
    complianceItemsOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ComplianceItem",
      },
    ],

    /**
     * Custom pricing for each compliance item
     * Allows provider to set different rates for different services
     */
    pricingPerItem: [
      {
        complianceItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ComplianceItem",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        estimatedDays: {
          type: Number,
          default: 7,
          min: 1,
        },
      },
    ],

    location: {
      type: String,
      trim: true,
      default: "Chennai, Tamil Nadu",
      index: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalCustomers: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    // Additional metadata
    specializations: [String],

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    // Business documents for verification
    businessRegistration: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search
serviceProviderSchema.index({
  companyName: "text",
  description: "text",
  specializations: "text",
});

// Compound indexes
serviceProviderSchema.index({ status: 1, rating: -1 });
serviceProviderSchema.index({ status: 1, completedBookings: -1 });

export default mongoose.model("ServiceProvider", serviceProviderSchema);
