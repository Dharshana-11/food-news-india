// controllers/documentVaultController.js
import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import ComplianceItem from "../models/ComplianceItem.js";

/**
 * @desc Get all documents for the logged-in business owner
 * @route GET /api/business-owner/documents
 * @access Private (Business Owner)
 */
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { category, status, search, expiry } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const filter = {
      uploadedForUser: userId,
      status: { $ne: "trash" },
    };

    // Optional filters
    if (status) filter.status = status;

    if (search) {
      filter["file.originalName"] = { $regex: search.trim(), $options: "i" };
    }

    // Expiry-based filtering
    if (expiry === "expiring_soon") {
      const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      filter.validUntil = { $lte: next30Days, $gte: new Date() };
    } else if (expiry === "expired") {
      filter.validUntil = { $lt: new Date() };
    }

    const documents = await Document.find(filter)
      .populate("kycDocumentId", "name code")
      .populate("complianceItemId", "name code validityDays")
      .sort({ createdAt: -1 });

    // Group documents
    const grouped = { kyc: [], compliance: [] };
    documents.forEach((doc) => {
      if (doc.kycDocumentId) grouped.kyc.push(doc);
      else if (doc.complianceItemId) grouped.compliance.push(doc);
    });

    return res.json({
      success: true,
      data: { all: documents, grouped },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

/**
 * @desc Upload a new document
 * @route POST /api/business-owner/documents
 * @access Private (Business Owner)
 */
export const uploadMyDocument = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { kycDocumentId, complianceItemId, validFrom } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Validate exactly one type
    if (!!kycDocumentId === !!complianceItemId) {
      return res.status(400).json({
        success: false,
        message: "Document must link to exactly ONE: KYC or Compliance",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // ===============================================
    // Duplicate handling — YOUR REQUIRED LOGIC
    // Soft delete old document for same item
    // ===============================================
    let existing;
    if (kycDocumentId) {
      existing = await Document.findOne({
        uploadedForUser: userId,
        kycDocumentId,
        status: { $ne: "trash" },
      });
    }

    if (complianceItemId) {
      existing = await Document.findOne({
        uploadedForUser: userId,
        complianceItemId,
        status: { $ne: "trash" },
      });
    }

    if (existing) {
      existing.status = "trash";
      await existing.save();
    }
    // ===============================================

    let computedValidUntil = null;

    // Compliance expiry
    if (complianceItemId) {
      const complianceItem = await ComplianceItem.findById(complianceItemId);
      if (!complianceItem) {
        return res.status(404).json({
          success: false,
          message: "Compliance item not found",
        });
      }

      if (!validFrom) {
        return res.status(400).json({
          success: false,
          message: "validFrom is required for compliance items",
        });
      }

      const startDate = new Date(validFrom);
      computedValidUntil = new Date(
        startDate.getTime() + complianceItem.validityDays * 24 * 60 * 60 * 1000
      );
    }

    const fileMeta = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype?.split("/")[1] ?? "unknown",
      storageProvider: "local",
    };

    const document = await Document.create({
      uploadedByUser: userId,
      uploadedForUser: userId,
      kycDocumentId,
      complianceItemId,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: computedValidUntil,
      file: fileMeta,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

/**
 * @desc Soft delete a document
 * @route DELETE /api/business-owner/documents/:id
 * @access Private (Business Owner)
 */
export const deleteMyDocument = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const document = await Document.findOne({
      _id: id,
      uploadedForUser: userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    document.status = "trash";
    await document.save();

    return res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

/**
 * @desc Get document statistics
 * @route GET /api/business-owner/documents/stats
 * @access Private (Business Owner)
 */
export const getMyDocumentStats = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const total = await Document.countDocuments({
      uploadedForUser: userId,
      status: { $ne: "trash" },
    });

    const approved = await Document.countDocuments({
      uploadedForUser: userId,
      status: "approved",
    });

    const pending = await Document.countDocuments({
      uploadedForUser: userId,
      status: "pending",
    });

    const expiringSoon = await Document.countDocuments({
      uploadedForUser: userId,
      status: { $ne: "trash" },
      validUntil: {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $gte: new Date(),
      },
    });

    const expired = await Document.countDocuments({
      uploadedForUser: userId,
      validUntil: { $lt: new Date() },
    });

    return res.json({
      success: true,
      data: { total, approved, pending, expiringSoon, expired },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

/**
 * @desc Get all active KYC + Compliance categories
 * @route GET /api/business-owner/documents/categories
 * @access Private
 */
export const getDocumentCategories = async (req, res) => {
  try {
    const kycDocs = await KYCDocument.find({
      status: "active",
      applicableRoles: "business_owner",
    }).select("name code");

    const complianceDocs = await ComplianceItem.find({
      status: "active",
    }).select("name code validityDays");

    return res.json({
      success: true,
      data: { kyc: kycDocs, compliance: complianceDocs },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * @desc Rename a document
 * @route PATCH /api/business-owner/documents/:id/rename
 * @access Private (Business Owner)
 */
export const renameMyDocument = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { newFileName } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!newFileName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "New file name is required",
      });
    }

    const document = await Document.findOne({
      _id: id,
      uploadedForUser: userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    document.file.originalName = newFileName.trim();
    await document.save();

    return res.json({
      success: true,
      message: "Document renamed successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error renaming document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to rename document",
      error: error.message,
    });
  }
};
