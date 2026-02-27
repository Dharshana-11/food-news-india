/**
 * agentDocumentController.js
 * ============================================================================
 * Agent Document Controller
 *
 * Handles document-related operations performed by agents for their
 * assigned businesses, including:
 * - Business-level document overview
 * - Business-specific document listing with filters
 * - Document upload with permission enforcement
 * - Category retrieval (KYC & Compliance)
 * - Soft delete and rename actions
 */

import BusinessAgentRelation from "../models/BusinessAgentRelation.js";
import Users from "../models/User.js";
import BusinessProfile from "../models/BusinessProfile.js";
import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import ComplianceItem from "../models/ComplianceItem.js";
import { calculateComplianceScoreForBusiness } from "../services/complianceScoreService.js";

/**
 * GET /api/agent/documents
 * ----------------------------------------------------------------------------
 * Fetch an overview of all active businesses assigned to the agent.
 *
 * Includes:
 * - Business profile details
 * - Document statistics (total, pending, approved, expired)
 * - Compliance score and missing items
 * - Agent permissions and assignment metadata
 */
export const getAgentDocumentOverview = async (req, res) => {
  try {
    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Find all active relations
    const relations = await BusinessAgentRelation.find({
      agentId: agent._id,
      status: "active",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .sort({ acceptedAt: -1 })
      .lean();

    const businesses = await Promise.all(
      relations.map(async (relation) => {
        const businessOwner = relation.businessOwnerId;

        // Fetch business profile
        const businessProfile = await BusinessProfile.findOne({
          userId: businessOwner._id,
        })
          .select("businessName registeredAddress businessTypeId")
          .populate("businessTypeId", "name")
          .lean();

        const [totalDocs, pendingDocs, approvedDocs, expiredDocs] =
          await Promise.all([
            Document.countDocuments({
              uploadedForUser: businessOwner._id,
              status: { $ne: "trash" },
            }),

            Document.countDocuments({
              uploadedForUser: businessOwner._id,
              status: "pending",
            }),

            Document.countDocuments({
              uploadedForUser: businessOwner._id,
              status: "approved",
            }),

            Document.countDocuments({
              uploadedForUser: businessOwner._id,
              status: { $ne: "trash" },
              $or: [{ status: "expired" }, { validUntil: { $lt: new Date() } }],
            }),
          ]);

        // Compliance score (shared service)
        const complianceData = await calculateComplianceScoreForBusiness(
          businessOwner._id,
        );

        return {
          relationId: relation._id,
          businessOwnerId: businessOwner._id,
          businessName: businessProfile?.businessName || "N/A",
          ownerName: businessOwner.name || "N/A",
          city: businessOwner.city,
          state: businessOwner.state,
          businessType: businessProfile?.businessTypeId?.name || "N/A",

          documentStats: {
            total: totalDocs,
            pending: pendingDocs,
            approved: approvedDocs,
            expired: expiredDocs,
          },

          compliance: {
            score: complianceData.score,
            totalRequired: complianceData.totalRequired,
            fulfilled: complianceData.fulfilled,
            missing: complianceData.missing,
            missingItems: complianceData.missingItems,
          },

          permissions: relation.permissions,
          acceptedAt: relation.acceptedAt,
        };
      }),
    );

    res.status(200).json({
      success: true,
      businesses,
      count: businesses.length,
    });
  } catch (error) {
    console.error("Get agent document overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document overview",
      error: error.message,
    });
  }
};

/**
 * GET /api/agent/documents/business/:relationId
 * ----------------------------------------------------------------------------
 * Fetch documents for a specific business assigned to the agent.
 *
 * Supports filtering by:
 * - category (kyc | compliance)
 * - status (pending | approved | expired)
 * - expiry (expiring_soon | expired)
 * - search text (category name or file name)
 *
 * Returns matching documents, stats, and agent permissions.
 */
export const getBusinessDocuments = async (req, res) => {
  try {
    const { relationId } = req.params;
    const { category, status, search, expiry } = req.query;

    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Verify relation ownership
    const relation = await BusinessAgentRelation.findOne({
      _id: relationId,
      agentId: agent._id,
      status: "active",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .lean();

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Business relation not found or not active",
      });
    }

    const businessOwner = relation.businessOwnerId;

    /* --------------------------------------------------
     * Base filter (trash-safe)
     * -------------------------------------------------- */
    const filter = {
      uploadedForUser: businessOwner._id,
      status: { $ne: "trash" },
    };

    /* --------------------------------------------------
     * Status filter
     * -------------------------------------------------- */
    if (status && status !== "expired") {
      filter.status = status;
    }

    /* --------------------------------------------------
     * Category filter
     * -------------------------------------------------- */
    if (category === "kyc") {
      filter.kycDocumentId = { $ne: null };
    } else if (category === "compliance") {
      filter.complianceItemId = { $ne: null };
    }

    /* --------------------------------------------------
     * Expiry filter
     * -------------------------------------------------- */
    if (expiry === "expiring_soon") {
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      filter.validUntil = {
        $ne: null,
        $gt: now,
        $lte: thirtyDaysFromNow,
      };
    }

    if (expiry === "expired" || status === "expired") {
      filter.$or = [{ status: "expired" }, { validUntil: { $lt: new Date() } }];
    }

    /* --------------------------------------------------
     * Fetch documents
     * -------------------------------------------------- */
    let documents = await Document.find(filter)
      .populate("kycDocumentId", "name code description")
      .populate("complianceItemId", "name code description category")
      .populate("uploadedByUser", "name email")
      .sort({ createdAt: -1 })
      .lean();

    /* --------------------------------------------------
     * Search filter (post-fetch)
     * -------------------------------------------------- */
    if (search) {
      const searchLower = search.toLowerCase();

      documents = documents.filter((doc) => {
        const categoryName =
          doc.kycDocumentId?.name || doc.complianceItemId?.name || "";
        const fileName = doc.file?.originalName || "";

        return (
          categoryName.toLowerCase().includes(searchLower) ||
          fileName.toLowerCase().includes(searchLower)
        );
      });
    }

    /* --------------------------------------------------
     * Stats (matches list)
     * -------------------------------------------------- */
    const [totalDocs, pendingDocs, approvedDocs, expiredDocs] =
      await Promise.all([
        Document.countDocuments({
          uploadedForUser: businessOwner._id,
          status: { $ne: "trash" },
        }),

        Document.countDocuments({
          uploadedForUser: businessOwner._id,
          status: "pending",
        }),

        Document.countDocuments({
          uploadedForUser: businessOwner._id,
          status: "approved",
        }),

        Document.countDocuments({
          uploadedForUser: businessOwner._id,
          status: { $ne: "trash" },
          $or: [{ status: "expired" }, { validUntil: { $lt: new Date() } }],
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        business: {
          name: relation.businessOwnerId.name,
          relationId: relation._id,
        },
        documents,
        stats: {
          total: totalDocs,
          pending: pendingDocs,
          approved: approvedDocs,
          expired: expiredDocs,
        },
        permissions: relation.permissions,
      },
    });
  } catch (error) {
    console.error("Get business documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

/**
 * POST /api/agent/documents/upload
 * ----------------------------------------------------------------------------
 * Upload a document for a business.
 *
 * Enforces:
 * - Active agent-business relation
 * - Upload permission check
 * - Category validation (KYC or Compliance)
 *
 * Notes:
 * - Existing documents of the same category are soft-deleted
 * - Compliance documents require validFrom to compute expiry
 */
export const uploadDocumentForBusiness = async (req, res) => {
  try {
    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    const { relationId, categoryType, categoryId, validFrom } = req.body;

    // Verify relation and permissions
    const relation = await BusinessAgentRelation.findOne({
      _id: relationId,
      agentId: agent._id,
      status: "active",
    }).lean();

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Business relation not found or not active",
      });
    }

    if (!relation.permissions?.canUploadDocuments) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to upload documents",
      });
    }

    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // ============================
    // Validate category
    // ============================
    let complianceItem = null;

    if (categoryType === "kyc") {
      const kycDoc = await KYCDocument.findById(categoryId);
      if (!kycDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid KYC document category",
        });
      }
    } else if (categoryType === "compliance") {
      complianceItem = await ComplianceItem.findById(categoryId);
      if (!complianceItem) {
        return res.status(400).json({
          success: false,
          message: "Invalid compliance item category",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category type",
      });
    }

    // ============================
    // Soft delete existing document (BO parity)
    // ============================
    let existingDocument;

    if (categoryType === "kyc") {
      existingDocument = await Document.findOne({
        uploadedForUser: relation.businessOwnerId,
        kycDocumentId: categoryId,
        status: { $ne: "trash" },
      });
    }

    if (categoryType === "compliance") {
      existingDocument = await Document.findOne({
        uploadedForUser: relation.businessOwnerId,
        complianceItemId: categoryId,
        status: { $ne: "trash" },
      });
    }

    if (existingDocument) {
      existingDocument.status = "trash";
      await existingDocument.save();
    }

    // ============================
    // Compliance validity handling
    // ============================
    let computedValidUntil = null;

    if (categoryType === "compliance") {
      if (!validFrom) {
        return res.status(400).json({
          success: false,
          message: "validFrom is required for compliance documents",
        });
      }

      const startDate = new Date(validFrom);
      computedValidUntil = new Date(
        startDate.getTime() + complianceItem.validityDays * 24 * 60 * 60 * 1000,
      );
    }

    // ============================
    // Create document
    // ============================
    const documentData = {
      uploadedByUser: agent._id,
      uploadedForUser: relation.businessOwnerId,
      status: "pending",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: `uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype.split("/")[1],
        storageProvider: "local",
      },
    };

    if (categoryType === "kyc") {
      documentData.kycDocumentId = categoryId;
    } else {
      documentData.complianceItemId = categoryId;
      documentData.validFrom = new Date(validFrom);
      documentData.validUntil = computedValidUntil;
    }

    const document = await Document.create(documentData);

    // Populate for response
    await document.populate([
      { path: "kycDocumentId", select: "name code" },
      { path: "complianceItemId", select: "name code" },
      { path: "uploadedByUser", select: "name email" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

/**
 * GET /api/agent/documents/categories
 * ----------------------------------------------------------------------------
 * Retrieve available document categories for agent uploads.
 *
 * Returns:
 * - Active KYC document categories
 * - Active compliance item categories
 */
export const getDocumentCategories = async (req, res) => {
  try {
    const { relationId } = req.query;

    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Verify relation
    const relation = await BusinessAgentRelation.findOne({
      _id: relationId,
      agentId: agent._id,
      status: "active",
    }).lean();

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Business relation not found",
      });
    }

    // Fetch categories
    const [kycDocuments, complianceItems] = await Promise.all([
      KYCDocument.find({ status: "active" })
        .select("name code description isMandatory")
        .lean(),
      ComplianceItem.find({ status: "active" })
        .select("name code description category")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        kyc: kycDocuments,
        compliance: complianceItems,
      },
    });
  } catch (error) {
    console.error("Get document categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/agent/documents/:documentId
 * ----------------------------------------------------------------------------
 * Soft delete a document by moving it to trash.
 *
 * Requires:
 * - Active agent-business relation
 * - Document upload/delete permission
 */
export const deleteAgentDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Verify agent → business relation
    const relation = await BusinessAgentRelation.findOne({
      agentId: agent._id,
      businessOwnerId: document.uploadedForUser,
      status: "active",
    }).lean();

    if (!relation) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    if (!relation.permissions?.canUploadDocuments) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete documents",
      });
    }

    document.status = "trash";
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document moved to trash",
    });
  } catch (error) {
    console.error("Delete agent document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

/**
 * PATCH /api/agent/documents/:documentId/rename
 * ----------------------------------------------------------------------------
 * Rename a document by updating the original file name only.
 *
 * Notes:
 * - Stored file name and storage path remain unchanged
 * - Requires active agent-business relation and permission
 */
export const renameAgentDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { originalName } = req.body;

    if (!originalName || !originalName.trim()) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const relation = await BusinessAgentRelation.findOne({
      agentId: agent._id,
      businessOwnerId: document.uploadedForUser,
      status: "active",
    }).lean();

    if (!relation || !relation.permissions?.canUploadDocuments) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to rename documents",
      });
    }

    document.file.originalName = originalName.trim();
    await document.save();

    res.status(200).json({
      success: true,
      message: "Document renamed successfully",
    });
  } catch (error) {
    console.error("Rename agent document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rename document",
    });
  }
};
