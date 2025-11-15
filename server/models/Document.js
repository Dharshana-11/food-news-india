import mongoose from "mongoose";

const { Schema } = mongoose;

const DocumentSchema = new Schema(
  {
    // Who uploaded the file
    uploadedByUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // For which user (always a Business Owner)
    uploadedForUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    // Link to either KYC or Compliance — exactly one must exist
    kycDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "KYCDocument",
      default: null,
    },
    complianceItemId: {
      type: Schema.Types.ObjectId,
      ref: "ComplianceItem",
      default: null,
    },

    // File storage meta
    file: {
      originalName: { type: String, required: true },   // user uploaded filename
      storedName: { type: String, required: true },     // safe generated name
      filePath: { type: String, required: true },       // full URL / local path
      fileSize: { type: Number, required: true },       // in bytes
      fileType: { type: String, enum: ["pdf", "jpg", "jpeg", "png"], required: true },
      storageProvider: {
        type: String,
        enum: ["local", "firebase", "aws_s3"],
        default: "local",
      },
    },

    // Validity (mainly for compliance docs)
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },

    // Document review status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired", "trash"],
      default: "pending",
    },

    // Admin or reviewer notes
    reviewNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Custom validation: Only one of KYC or Compliance allowed
DocumentSchema.pre("validate", function (next) {
  const hasKYC = !!this.kycDocumentId;
  const hasCompliance = !!this.complianceItemId;

  if (hasKYC === hasCompliance) {
    return next(
      new Error("Document must be linked to exactly one: KYC Document OR Compliance Item")
    );
  }

  next();
});

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
