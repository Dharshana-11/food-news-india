import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @typedef {Object} DocumentFile
 * @property {string} originalName - Filename uploaded by the user.
 * @property {string} storedName - Generated safe filename stored on server.
 * @property {string} filePath - Absolute/relative path of the stored file.
 * @property {number} fileSize - Size in bytes.
 * @property {"pdf"|"jpg"|"jpeg"|"png"} fileType - File type/extension.
 * @property {"local"|"firebase"|"aws_s3"} storageProvider - Storage mechanism used.
 */

/**
 * @typedef {Object} Document
 * @property {mongoose.Types.ObjectId} uploadedByUser - User who uploaded the document.
 * @property {mongoose.Types.ObjectId} uploadedForUser - Target user (Business Owner).
 * @property {mongoose.Types.ObjectId|null} kycDocumentId - Linked KYC doc (mutually exclusive).
 * @property {mongoose.Types.ObjectId|null} complianceItemId - Linked Compliance doc (mutually exclusive).
 * @property {mongoose.Types.ObjectId|null} serviceProviderServiceId - Linked Service Provider ID (mutually exclusive).
 * @property {DocumentFile} file - File metadata.
 * @property {Date|null} validFrom - Start of document validity.
 * @property {Date|null} validUntil - End of document validity.
 * @property {"pending"|"approved"|"rejected"|"expired"|"trash"} status - Review lifecycle.
 * @property {string} reviewNotes - Notes from admin/reviewer.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const DocumentSchema = new Schema(
  {
    /**
     * The admin or user who uploaded the document.
     */
    uploadedByUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    /**
     * The user for whom this document is uploaded.
     * - Business Owner (business compliance)
     * - Service Provider (service authorization)
     */
    uploadedForUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    /**
     * KYC document reference
     */
    kycDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "KYCDocument",
      default: null,
    },

    /**
     * Business compliance document reference
     */
    complianceItemId: {
      type: Schema.Types.ObjectId,
      ref: "ComplianceItem",
      default: null,
    },

    /**
     * Service Provider authorization document reference
     * (used when provider uploads docs to get a service approved)
     */
    serviceProviderServiceId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProviderService",
      default: null,
    },

    /**
     * Metadata about the stored file.
     */
    file: {
      originalName: { type: String, required: true },
      storedName: { type: String, required: true },
      filePath: { type: String, required: true },
      fileSize: { type: Number, required: true },
      fileType: {
        type: String,
        enum: ["pdf", "jpg", "jpeg", "png"],
        required: true,
      },
      storageProvider: {
        type: String,
        enum: ["local", "firebase", "aws_s3"],
        default: "local",
      },
    },

    /**
     * Validity dates (mainly for compliance documents)
     */
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },

    /**
     * Review and lifecycle status.
     */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired", "trash"],
      default: "pending",
    },

    /**
     * Notes added by reviewer/admin.
     */
    reviewNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/**
 * Ensures document is linked to EXACTLY ONE context:
 * - KYC
 * - Business Compliance
 * - Service Provider Authorization
 */
DocumentSchema.pre("validate", function (next) {
  const links = [
    this.kycDocumentId,
    this.complianceItemId,
    this.serviceProviderServiceId,
  ].filter(Boolean);

  if (links.length !== 1) {
    return next(
      new Error(
        "Document must be linked to exactly one: KYC, Compliance Item, or Service Provider Service"
      )
    );
  }

  next();
});

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
