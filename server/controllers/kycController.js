import Document from "../models/Document.js";
import BusinessProfile from "../models/BusinessProfile.js";
import KYCDocument from "../models/KYCDocument.js";
import User from "../models/Users.js";
import path from "path";

/**
 * @desc Get KYC requirements for the logged-in user
 * @route GET /api/kyc/requirements
 * @access Private
 */
export const getKYCRequirements = async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const kycDocuments = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    }).select("name code description");

    const uploadedDocs = await Document.find({
      uploadedForUser: user._id,
      kycDocumentId: { $ne: null },
      status: { $ne: "trash" },
    })
      .populate("kycDocumentId", "code")
      .select(
        "kycDocumentId status file validFrom validUntil reviewNotes createdAt",
      );

    const uploadedMap = {};
    uploadedDocs.forEach((doc) => {
      if (doc?.kycDocumentId?.code) {
        uploadedMap[doc.kycDocumentId.code] = {
          _id: doc._id,
          status: doc.status,
          fileName: doc.file.originalName,
          uploadedAt: doc.createdAt,
          reviewNotes: doc.reviewNotes,
        };
      }
    });

    const requirements = kycDocuments.map((kyc) => ({
      _id: kyc._id,
      name: kyc.name,
      code: kyc.code,
      description: kyc.description,
      uploaded: uploadedMap[kyc.code] || null,
    }));

    return res.json({ requirements });
  } catch (error) {
    console.error("Error fetching KYC requirements:", error);
    return res.status(500).json({ error: "Failed to fetch KYC requirements" });
  }
};

/**
 * @desc Get user's business profile and KYC status
 * @route GET /api/kyc/profile
 * @access Private
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
      "name code",
    );

    if (!profile) {
      profile = await BusinessProfile.create({
        userId: user._id,
        kycStatus: "pending",
        kycProgress: 0,
      });
    }

    return res.json({ profile });
  } catch (error) {
    console.error("Error fetching KYC profile:", error);
    return res.status(500).json({ error: "Failed to fetch KYC profile" });
  }
};

/**
 * @desc Upload a KYC document
 * @route POST /api/kyc/upload
 * @access Private
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

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const kycDoc = await KYCDocument.findOne({
      code: kycDocumentCode.toUpperCase(),
      status: "active",
    });

    if (!kycDoc) {
      return res.status(404).json({ error: "Invalid KYC document code" });
    }

    if (!kycDoc.applicableRoles.includes(user.role)) {
      return res.status(403).json({
        error: "This document is not required for your role",
      });
    }

    await Document.updateMany(
      {
        uploadedForUser: user._id,
        kycDocumentId: kycDoc._id,
        status: { $ne: "trash" },
      },
      { status: "trash" },
    );

    const document = await Document.create({
      uploadedByUser: user._id,
      uploadedForUser: user._id,
      kycDocumentId: kycDoc._id,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: path
          .extname(req.file.originalname)
          ?.substring(1)
          ?.toLowerCase(),
        storageProvider: "local",
      },
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      status: "pending",
    });

    await updateKYCProgress(user._id);

    return res.json({
      message: "Document uploaded successfully",
      document: {
        _id: document._id,
        status: document.status,
        fileName: document.file.originalName,
      },
    });
  } catch (error) {
    console.error("Error uploading KYC document:", error);
    return res.status(500).json({ error: "Failed to upload document" });
  }
};

/**
 * @desc Update business profile
 * @route PUT /api/kyc/profile
 * @access Private
 */
export const updateBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const updates = req.body;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
      { new: true, upsert: true },
    ).populate("businessTypeId", "name code");

    await updateKYCProgress(user._id);

    return res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating business profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

/**
 * @desc Submit KYC for review
 * @route POST /api/kyc/submit
 * @access Private
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
      uploadedDocs.some((id) => id.equals(doc._id)),
    );

    if (!allUploaded) {
      return res.status(400).json({
        error: "Please upload all required documents before submitting",
      });
    }

    profile.kycStatus = "in_review";
    await profile.save();

    return res.json({
      message: "KYC submitted for review successfully",
      profile,
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({ error: "Failed to submit KYC" });
  }
};

/**
 * @desc Helper: Calculate and update KYC progress
 * @param {string} userId
 */
async function updateKYCProgress(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const requiredDocs = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    });

    if (requiredDocs.length === 0) return;

    const uploadedDocs = await Document.find({
      uploadedForUser: userId,
      kycDocumentId: { $ne: null },
      status: { $nin: ["trash", "expired"] },
    });

    const uniqueKycDocIds = new Set(
      uploadedDocs.map((doc) => doc.kycDocumentId?.toString()),
    );

    const progress = Math.round(
      (uniqueKycDocIds.size / requiredDocs.length) * 100,
    );

    await BusinessProfile.findOneAndUpdate(
      { userId },
      { kycProgress: progress },
      { upsert: true },
    );

    console.log(`KYC Progress updated: ${progress}% for user ${userId}`);
  } catch (error) {
    console.error("Error updating KYC progress:", error);
  }
}
