import Document from "../models/Document.js";
import BusinessProfile from "../models/BusinessProfile.js";
import KYCDocument from "../models/KYCDocument.js";
import User from "../models/User.js";
import AgentProfile from "../models/AgentProfile.js";
import KYCProfile from "../models/KYCProfile.js";
import { checkAndUpdateUserVerification } from "../services/kycService.js";
import path from "path";
import ROLES from "../utils/constants/roles.js";

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
        "kycDocumentId status file validFrom validUntil reviewNotes createdAt"
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
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔹 1. Get or create KYC profile
    let kycProfile = await KYCProfile.findOne({ userId: user._id });

    if (!kycProfile) {
      kycProfile = await KYCProfile.create({
        userId: user._id,
        role: user.role,
      });
    }

    // 🔹 2. Get role-specific profile
    let roleProfile = null;

    switch (user.role) {
      case ROLES.BUSINESS_OWNER:
        roleProfile = await BusinessProfile.findOne({ userId: user._id });
        break;

      case ROLES.AGENT:
        roleProfile = await AgentProfile.findOne({ userId: user._id });
        break;

      default:
        roleProfile = null;
    }

    return res.json({
      kycProfile,
      roleProfile,
    });
  } catch (err) {
    console.error("Error fetching KYC profile:", err);
    res.status(500).json({ error: "Failed to fetch KYC profile" });
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
      { status: "trash" }
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
    const user = await User.findOne({ uid: req.user.uid });
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

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const businessProfile = await BusinessProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    // KYCProfile stays for status/progress ONLY
    await updateKYCProgress(user._id);

    return res.json({
      message: "Business profile updated successfully",
      profile: businessProfile,
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
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1️. Fetch KYCProfile (single source of truth)
    const kycProfile = await KYCProfile.findOne({ userId: user._id });
    if (!kycProfile) {
      return res.status(404).json({ error: "KYC profile not found" });
    }

    // 2️. Fetch required KYC documents for this role
    const requiredDocs = await KYCDocument.find({
      applicableRoles: user.role,
      status: "active",
    });

    // 3️. Fetch user's uploaded KYC docs
    const uploadedDocs = await Document.find({
      uploadedForUser: user._id,
      kycDocumentId: { $ne: null },
      status: { $ne: "trash" },
    });

    // 4️. Ensure every required document has at least ONE uploaded version
    const allUploaded = requiredDocs.every((requiredDoc) =>
      uploadedDocs.some(
        (uploadedDoc) =>
          uploadedDoc.kycDocumentId.toString() === requiredDoc._id.toString()
      )
    );

    if (!allUploaded) {
      return res.status(400).json({
        error: "Please upload all required documents before submitting",
      });
    }

    // 5️. Move KYC into review state
    kycProfile.kycStatus = "in_review";
    await kycProfile.save();

    // 6️. SAFETY: Re-check full verification
    // (handles cases where admin already approved docs)
    await checkAndUpdateUserVerification(user._id, user.role);

    return res.json({
      message: "KYC submitted for review successfully",
      kycProfile,
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
      uploadedDocs.map((doc) => doc.kycDocumentId?.toString())
    );

    const progress = Math.round(
      (uniqueKycDocIds.size / requiredDocs.length) * 100
    );

    await KYCProfile.findOneAndUpdate(
      { userId },
      { kycProgress: progress },
      { upsert: true }
    );

    console.log(`KYC Progress updated: ${progress}% for user ${userId}`);
  } catch (error) {
    console.error("Error updating KYC progress:", error);
  }
}
/**
 * GET agent profile for the logged-in user
 * - Creates an empty profile if it does not exist
 */
export const getAgentProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let profile = await AgentProfile.findOne({ userId: user._id });

    if (!profile) {
      profile = await AgentProfile.create({
        userId: user._id,
      });
    }

    return res.json({ profile });
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    return res.status(500).json({ error: "Failed to fetch agent profile" });
  }
};

/**
 * UPDATE agent profile for the logged-in user
 * - Only whitelisted fields can be updated
 * - Creates profile if it does not exist
 */
export const updateAgentProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /**
     * Fields that are safe to update from client input
     */
    const allowedFields = [
      "experience",
      "specialization",
      "city",
      "state",
      "languages",
      "bio",
      "monthlyCommission",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.monthlyCommission !== undefined &&
      (typeof updates.monthlyCommission !== "number" ||
        updates.monthlyCommission < 0)
    ) {
      return res
        .status(400)
        .json({ error: "Monthly commission must be a valid number" });
    }

    if (updates.experience !== undefined && updates.experience < 0) {
      return res.status(400).json({ error: "Experience cannot be negative" });
    }

    if (updates.languages !== undefined && !Array.isArray(updates.languages)) {
      return res.status(400).json({ error: "Languages must be an array" });
    }

    const profile = await AgentProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: updates },
      {
        new: true,
        upsert: true,
      }
    );

    return res.json({
      message: "Agent profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);
    return res.status(500).json({ error: "Failed to update agent profile" });
  }
};
