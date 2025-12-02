import Document from "../models/Document.js";
import BusinessProfile from "../models/BusinessProfile.js";
import KYCDocument from "../models/KYCDocument.js";
import User from "../models/Users.js";
import path from "path";

/**
 * Get KYC requirements for the logged-in user
 * GET /api/kyc/requirements
 */
export const getKYCRequirements = async (req, res) => {
  try {
    const userId = req.user.uid; // From auth middleware

    // Get user details
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get applicable KYC documents for this role
    const kycDocuments = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    }).select("name code description");

    // Get user's uploaded documents
    const uploadedDocs = await Document.find({
      uploadedForUser: user._id,
      kycDocumentId: { $ne: null },
      status: { $ne: "trash" },
    })
      .populate("kycDocumentId", "code")
      .select("kycDocumentId status file validFrom validUntil reviewNotes");

    // Map uploaded docs by KYC code
    const uploadedMap = {};
    uploadedDocs.forEach((doc) => {
      if (doc.kycDocumentId && doc.kycDocumentId.code) {
        uploadedMap[doc.kycDocumentId.code] = {
          _id: doc._id,
          status: doc.status,
          fileName: doc.file.originalName,
          uploadedAt: doc.createdAt,
          reviewNotes: doc.reviewNotes,
        };
      }
    });

    // Merge requirements with uploaded status
    const requirements = kycDocuments.map((kyc) => ({
      _id: kyc._id,
      name: kyc.name,
      code: kyc.code,
      description: kyc.description,
      uploaded: uploadedMap[kyc.code] || null,
    }));

    res.json({ requirements });
  } catch (error) {
    console.error("Error fetching KYC requirements:", error);
    res.status(500).json({ error: "Failed to fetch KYC requirements" });
  }
};

/**
 * Get user's business profile and KYC status
 * GET /api/kyc/profile
 */
export const getKYCProfile = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let profile = await BusinessProfile.findOne({ userId: user._id }).populate(
      "businessTypeId",
      "name code"
    );

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await BusinessProfile.create({
        userId: user._id,
        kycStatus: "pending",
        kycProgress: 0,
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Error fetching KYC profile:", error);
    res.status(500).json({ error: "Failed to fetch KYC profile" });
  }
};

/**
 * Upload KYC document
 * POST /api/kyc/upload
 * Body: { kycDocumentCode, validFrom?, validUntil? }
 * File: multipart/form-data
 */
export const uploadKYCDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { kycDocumentCode, validFrom, validUntil } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!kycDocumentCode) {
      return res.status(400).json({ error: "kycDocumentCode is required" });
    }

    // Get user
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find KYC document definition
    const kycDoc = await KYCDocument.findOne({
      code: kycDocumentCode.toUpperCase(),
      status: "active",
    });

    if (!kycDoc) {
      return res.status(404).json({ error: "Invalid KYC document code" });
    }

    // Check if user's role is applicable
    if (!kycDoc.applicableRoles.includes(user.role)) {
      return res.status(403).json({ error: "This document is not required for your role" });
    }

    // Check if document already exists (replace old one by marking as trash)
    await Document.updateMany(
      {
        uploadedForUser: user._id,
        kycDocumentId: kycDoc._id,
        status: { $ne: "trash" },
      },
      { status: "trash" }
    );

    // Create new document record
    const document = await Document.create({
      uploadedByUser: user._id,
      uploadedForUser: user._id,
      kycDocumentId: kycDoc._id,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
        storageProvider: "local",
      },
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      status: "pending",
    });

    // Update KYC progress
    await updateKYCProgress(user._id);

    res.json({
      message: "Document uploaded successfully",
      document: {
        _id: document._id,
        status: document.status,
        fileName: document.file.originalName,
      },
    });
  } catch (error) {
    console.error("Error uploading KYC document:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

/**
 * Update business profile details
 * PUT /api/kyc/profile
 */
export const updateBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const updates = req.body;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Allowed fields to update
    const allowedFields = [
      "businessTypeId",
      "businessName",
      "registeredAddress",
      "fssaiLicenseNumber",
      "fssaiValidityPeriod",
      "fssaiCategory",
      "gstNumber",
      "dateOfBirth",
      "aadhaarNumber",
      "panNumber",
    ];

    const filteredUpdates = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: filteredUpdates },
      { new: true, upsert: true }
    ).populate("businessTypeId", "name code");

    // Update progress
    await updateKYCProgress(user._id);

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating business profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

/**
 * Submit KYC for review
 * POST /api/kyc/submit
 */
export const submitKYCForReview = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = await BusinessProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if all required KYC docs are uploaded
    const requiredDocs = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    });

    const uploadedDocs = await Document.find({
      uploadedForUser: user._id,
      kycDocumentId: { $ne: null },
      status: { $ne: "trash" },
    }).distinct("kycDocumentId");

    const allUploaded = requiredDocs.every((doc) =>
      uploadedDocs.some((id) => id.equals(doc._id))
    );

    if (!allUploaded) {
      return res.status(400).json({
        error: "Please upload all required documents before submitting",
      });
    }

    // Update status to in_review
    profile.kycStatus = "in_review";
    await profile.save();

    res.json({
      message: "KYC submitted for review successfully",
      profile,
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ error: "Failed to submit KYC" });
  }
};

/**
 * Helper: Calculate and update KYC progress
 */
async function updateKYCProgress(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Get required KYC docs
    const requiredDocs = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    });

    if (requiredDocs.length === 0) {
      return;
    }

    // Get uploaded docs
    const uploadedDocs = await Document.find({
      uploadedForUser: userId,
      kycDocumentId: { $ne: null },
      status: { $ne: "trash" },
    }).distinct("kycDocumentId");

    const progress = Math.round((uploadedDocs.length / requiredDocs.length) * 100);

    await BusinessProfile.findOneAndUpdate(
      { userId },
      { kycProgress: progress },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error updating KYC progress:", error);
  }
}