/**
 * AgentProfile Model
 * ============================================================================
 * Stores extended profile information for users with role = "agent".
 * Contains professional details, performance metrics, availability,
 * commission info, and location/language preferences.
 *
 * This model is linked one-to-one with the Users collection.
 */

import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * AgentProfile Schema
 */
const agentProfileSchema = new Schema(
  {
    /**
     * Reference to the main user document.
     * One-to-one relationship (one agent per user).
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
      index: true,
    },

    /* ------------------------------------------------------------------------
     * Professional Details
     * ----------------------------------------------------------------------*/

    /**
     * Total years of professional experience.
     */
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Areas of specialization handled by the agent.
     * Example: ["FSSAI", "GST", "Trade License"]
     */
    specialization: {
      type: [String],
      default: [],
    },

    /**
     * Monthly commission charged per business (₹).
     */
    commissionRate: {
      type: Number,
      default: 7500,
      min: 0,
    },

    /* ------------------------------------------------------------------------
     * Performance Metrics
     * ----------------------------------------------------------------------*/

    /**
     * Average rating received from business owners (0–5).
     */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    /**
     * Total number of reviews received.
     */
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Number of businesses currently or historically managed.
     */
    businessesManaged: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Total applications submitted by the agent.
     */
    totalApplicationsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Total documents uploaded by the agent.
     */
    totalDocumentsUploaded: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ------------------------------------------------------------------------
     * Availability & Capacity
     * ----------------------------------------------------------------------*/

    /**
     * Indicates whether the agent is currently accepting new businesses.
     */
    isAvailable: {
      type: Boolean,
      default: true,
    },

    /**
     * Maximum number of businesses the agent can handle at a time.
     */
    maxBusinesses: {
      type: Number,
      default: 10,
      min: 1,
    },

    /* ------------------------------------------------------------------------
     * Bank Details (used for commission payouts)
     * ----------------------------------------------------------------------*/

    bankDetails: {
      /**
       * Bank account number (excluded from queries by default).
       */
      accountNumber: {
        type: String,
        default: "",
        select: false,
      },

      /**
       * IFSC code of the bank branch.
       */
      ifscCode: {
        type: String,
        default: "",
      },

      /**
       * Name of the account holder.
       */
      accountHolderName: {
        type: String,
        default: "",
      },

      /**
       * Bank name.
       */
      bankName: {
        type: String,
        default: "",
      },
    },

    /* ------------------------------------------------------------------------
     * Profile & Location
     * ----------------------------------------------------------------------*/

    /**
     * Short professional bio of the agent.
     */
    bio: {
      type: String,
      maxlength: 500,
      default: "",
      trim: true,
    },

    /**
     * City where the agent primarily operates.
     */
    city: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * State where the agent primarily operates.
     */
    state: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Languages known by the agent.
     * Example: ["English", "Hindi", "Tamil"]
     */
    languages: {
      type: [String],
      default: ["English"],
    },
  },
  {
    timestamps: true,
  }
);

/* --------------------------------------------------------------------------
 * Indexes (for filtering & sorting)
 * ------------------------------------------------------------------------*/

/**
 * Used for sorting agents by rating (top-rated first).
 */
agentProfileSchema.index({ rating: -1 });

/**
 * Used for filtering available agents and load balancing.
 */
agentProfileSchema.index({ isAvailable: 1, businessesManaged: 1 });

/**
 * Used for location-based agent searches.
 */
agentProfileSchema.index({ city: 1, state: 1 });

export default mongoose.model("AgentProfile", agentProfileSchema);
