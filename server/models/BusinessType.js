import mongoose from "mongoose";

/**
 * @typedef {Object} BusinessType
 * @property {string} name - Display name of the business type (e.g., "Restaurant", "Retailer").
 * @property {string} code - Unique short code (e.g., "REST", "RETAIL").
 * @property {string} description - Optional description of the business type.
 * @property {"active"|"inactive"|"trash"} status - Current status of the business type.
 * @property {number} sortOrder - Custom sort ranking for UI ordering.
 * @property {Date} createdAt - Record creation timestamp.
 * @property {Date} updatedAt - Record update timestamp.
 */

const businessTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("BusinessType", businessTypeSchema);
