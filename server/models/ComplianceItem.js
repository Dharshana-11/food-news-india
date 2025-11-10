import mongoose from "mongoose";

const complianceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate item names
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
      default: "",
      trim: true
    },
    required: {
      type: Boolean,
      default: true // whether businesses must upload a document in this item
    },
    ruleExpression: {  // Future use: e.g., businessType=='Restaurant'
       type: String, 
       default: "" 
    }, 
    status: {
      type: String,
      enum: ["active", "inactive", "trash"],
      default: "active" // true = active, false = inactive (soft delete)
    },
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceItem", complianceItemSchema);
