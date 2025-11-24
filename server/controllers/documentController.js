import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import ComplianceItem from "../models/ComplianceItem.js";
import { unlinkSync } from "fs";
import { join } from "path";

/**
 * Validate referenced model exists
 * @param {Model} model
 * @param {string} id
 * @param {string} label
 */
const validateReferenceExists = async (model, id, label) => {
  const exists = await model.findById(id);
  if (!exists) throw new Error(`${label} not found`);
};

/**
 * CREATE: Upload a new document
 * @route POST /api/documents
 */
export const createDocument = async (req, res) => {
  try {
    const { uploadedForUser, kycDocumentId, complianceItemId, validFrom } = req.body;

    // Mandatory field: uploadedForUser
    if (!uploadedForUser) {
      return res.status(400).json({
        success: false,
        message: "uploadedForUser is required",
      });
    }

    // Ensure exactly 1 document type
    if (!!kycDocumentId === !!complianceItemId) {
      return res.status(400).json({
        success: false,
        message: "Document must be linked to exactly ONE: KYC or Compliance",
      });
    }

    // Validate references
    if (kycDocumentId) {
      await validateReferenceExists(KYCDocument, kycDocumentId, "KYC Document");
    }

    // Compliance item: compute expiry
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

    // File required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
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
      uploadedByUser: req.user._id,
      uploadedForUser,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ALL: Paginated documents for admins
 * @route GET /api/documents
 */
export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {
      status: status || { $ne: "trash" },
    };

    if (search) {
      filter["file.originalName"] = { $regex: search, $options: "i" };
    }

    const documents = await Document.find(filter)
      .populate("uploadedByUser", "name email role")
      .populate("uploadedForUser", "name email role")
      .populate("kycDocumentId", "name code")
      .populate("complianceItemId", "name code validityDays")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Document.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Single Document
 * @route GET /api/documents/:id
 */
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploadedByUser", "name email role")
      .populate("uploadedForUser", "name email role")
      .populate("kycDocumentId", "name code")
      .populate("complianceItemId", "name code validityDays");

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    return res.status(200).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE: File or metadata
 * @route PUT /api/documents/:id
 */
export const updateDocument = async (req, res) => {
  try {
    const { validFrom, status, reviewNotes } = req.body;

    const doc = await Document.findById(req.params.id).populate(
      "complianceItemId",
      "validityDays"
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // File upload
    if (req.file) {
      try {
        if (doc.file?.filePath) {
          const absolutePath = join(process.cwd(), doc.file.filePath);
          unlinkSync(absolutePath);
        }
      } catch (err) {
        console.log("Error deleting old file:", err.message);
      }

      doc.file = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype.split("/")[1],
        storageProvider: "local",
      };
    }

    // Metadata update
    if (doc.kycDocumentId) {
      if (validFrom) doc.validFrom = new Date(validFrom);
      doc.validUntil = null;
    }

    if (doc.complianceItemId && validFrom) {
      const start = new Date(validFrom);
      const days = doc.complianceItemId.validityDays;
      doc.validFrom = start;
      doc.validUntil = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    }

    if (status) doc.status = status;
    if (reviewNotes !== undefined) doc.reviewNotes = reviewNotes;

    await doc.save();

    return res.status(200).json({
      success: true,
      message: req.file ? "Document updated with new file" : "Document updated",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SOFT DELETE (Move to trash)
 * @route DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "trash" },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Document moved to trash",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * REVIEW (approve/reject/expire)
 * @route PATCH /api/documents/:id/review
 */
export const reviewDocument = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!["approved", "rejected", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, reviewNotes: notes || "" },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Document ${status}`,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
