// controllers/documentVaultController.js
import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import ComplianceItem from "../models/ComplianceItem.js";

/**
 * GET: All documents for logged-in business owner
 * GET /api/business-owner/documents
 */
export const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, status, search, expiry } = req.query;

    // Build filter
    const filter = {
      uploadedForUser: userId,
      status: { $ne: "trash" },
    };

    if (status) filter.status = status;
    if (search) {
      filter["file.originalName"] = { $regex: search, $options: "i" };
    }

    // Expiry filter
    if (expiry === "expiring_soon") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filter.validUntil = { $lte: thirtyDaysFromNow, $gte: new Date() };
    } else if (expiry === "expired") {
      filter.validUntil = { $lt: new Date() };
    }

    const documents = await Document.find(filter)
      .populate("kycDocumentId", "name code")
      .populate("complianceItemId", "name code validityDays")
      .sort({ createdAt: -1 });

    // Group by category
    const grouped = {
      kyc: [],
      compliance: [],
    };

    documents.forEach((doc) => {
      if (doc.kycDocumentId) grouped.kyc.push(doc);
      else if (doc.complianceItemId) grouped.compliance.push(doc);
    });

    return res.json({
      success: true,
      data: {
        all: documents,
        grouped,
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST: Upload new document
 * POST /api/business-owner/documents
 */
export const uploadMyDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { kycDocumentId, complianceItemId, validFrom } = req.body;

    // Validate: exactly one document type
    if (!!kycDocumentId === !!complianceItemId) {
      return res.status(400).json({
        success: false,
        message: "Document must link to exactly ONE: KYC or Compliance",
      });
    }

    // File required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // Compute expiry for compliance docs
    let computedValidUntil = null;
    if (complianceItemId) {
      const complianceItem = await ComplianceItem.findById(complianceItemId);
      if (!complianceItem) {
        return res.status(404).json({
          success: false,
          message: "Compliance Item not found",
        });
      }

      if (!validFrom) {
        return res.status(400).json({
          success: false,
          message: "validFrom is required for Compliance documents",
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
      fileType: req.file.mimetype.split("/")[1],
      storageProvider: "local",
    };

    const document = await Document.create({
      uploadedByUser: userId,
      uploadedForUser: userId, // Business owner uploads for themselves
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
      message: error.message,
    });
  }
};

/**
 * DELETE: Soft delete document
 * DELETE /api/business-owner/documents/:id
 */
export const deleteMyDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

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
      message: error.message,
    });
  }
};

/**
 * GET: Document statistics
 * GET /api/business-owner/documents/stats
 */
export const getMyDocumentStats = async (req, res) => {
  try {
    const userId = req.user._id;

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
      data: {
        total,
        approved,
        pending,
        expiringSoon,
        expired,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET: Available categories
 * GET /api/business-owner/documents/categories
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
      data: {
        kyc: kycDocs,
        compliance: complianceDocs,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
