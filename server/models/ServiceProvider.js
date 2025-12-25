import mongoose from "mongoose";

/**
 * ServiceProvider Schema
 * -----------------------------------------------------------------------------
 * Represents a verified service provider who offers compliance-related services
 * (e.g., FSSAI, GST, Trade License) to business owners.
 *
 * One-to-one relationship with User (role: service_provider).
 *
 * @typedef {Object} ServiceProvider
 * @property {mongoose.Types.ObjectId} userId - Reference to Users collection
 * @property {string} companyName - Registered business/company name
 * @property {string} description - Description of services offered
 * @property {string} logo - Logo URL or storage path
 * @property {mongoose.Types.ObjectId[]} complianceItemsOffered - Supported compliance items
 * @property {Array<Object>} pricingPerItem - Item-wise pricing configuration
 * @property {string} location - Operating city/region
 * @property {number} rating - Average customer rating (0–5)
 * @property {number} totalCustomers - Unique customers served
 * @property {number} completedBookings - Successfully completed bookings
 * @property {string} status - Provider account status
 * @property {Date|null} verifiedAt - Verification timestamp
 * @property {mongoose.Types.ObjectId} verifiedBy - Admin who verified the provider
 * @property {string[]} specializations - Areas of expertise
 * @property {string} contactEmail - Business contact email
 * @property {string} contactPhone - Business contact phone number
 * @property {string} businessRegistration - Business registration document reference
 * @property {string} gstNumber - GST identification number
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const serviceProviderSchema = new mongoose.Schema(
  {
    /**
     * Linked user account (must have role: service_provider)
     */
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
     * Compliance items this provider can assist with
     */
    complianceItemsOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ComplianceItem",
      },
    ],

    /**
     * Custom pricing per compliance item
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

    /**
     * Additional metadata
     */
    specializations: {
      type: [String],
      default: [],
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    /**
     * Business verification details
     */
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

/**
 * Text search index
 */
serviceProviderSchema.index({
  companyName: "text",
  description: "text",
  specializations: "text",
});

/**
 * Query optimization indexes
 */
serviceProviderSchema.index({ status: 1, rating: -1 });
serviceProviderSchema.index({ status: 1, completedBookings: -1 });

export default mongoose.model("ServiceProvider", serviceProviderSchema);
