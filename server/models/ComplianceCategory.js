import mongoose from "mongoose";

const complianceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate category names
      trim: true,
      index: true
    },
    code: {
      type: String,
      unique: true,       // optional human-readable key (like FSSAI, HC)
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ""
    },
    required: {
      type: Boolean,
      default: true // whether businesses must upload a document in this category
    },
    status: {
      type: Boolean,
      default: true // true = active, false = inactive (soft delete)
    },
    defaultValidityDays: {
      type: Number,
      default: 365 // default validity period for documents in this category
    }
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceCategory", complianceCategorySchema);
