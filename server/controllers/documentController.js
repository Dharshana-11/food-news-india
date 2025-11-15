import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import ComplianceItem from "../models/ComplianceItem.js";
import { unlinkSync } from "fs";
import { join } from "path";

/**
 * Helper: validate referenced model exists
 */
const validateReferenceExists = async (model, id, label) => {
  const exists = await model.findById(id);
  if (!exists) throw new Error(`${label} not found`);
};

/**
 * CREATE Document
 */
export const createDocument = async (req, res) => {
  try {
    const {
      uploadedForUser,
      kycDocumentId,
      complianceItemId,
      validFrom,
    } = req.body;

    // Ensure EXACTLY one reference
    if (!!kycDocumentId === !!complianceItemId) {
      return res.status(400).json({
        success: false,
        message: "Document must link to exactly ONE: KYC or Compliance",
      });
    }

    // Validate referenced object exists
    if (kycDocumentId) {
      await validateReferenceExists(KYCDocument, kycDocumentId, "KYC Document");
    }

    let computedValidUntil = null; // default for KYC

    if (complianceItemId) {
      const complianceItem = await ComplianceItem.findById(complianceItemId);
      if (!complianceItem) {
        return res.status(404).json({
          success: false,
          message: "Compliance Item not found",
        });
      }

      // Ensure validFrom exists for compliance
      if (!validFrom) {
        return res.status(400).json({
          success: false,
          message: "validFrom is required for Compliance documents",
        });
      }

      // Auto compute expiry
      const startDate = new Date(validFrom);
      computedValidUntil = new Date(
        startDate.getTime() +
          complianceItem.validityDays * 24 * 60 * 60 * 1000
      );
    }

    // File data (from upload middleware)
    // File uploaded by multer
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
    fileType: req.file.mimetype.split("/")[1], // pdf, jpeg, png
    storageProvider: "local",
    };

    const doc = await Document.create({
      uploadedByUser: req.user._id,
      uploadedForUser,
      kycDocumentId,
      complianceItemId,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: computedValidUntil, // FINAL VALUE — based on rules
      file: fileMeta,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL Documents (Admin/SuperAdmin)
 */
export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter["file.originalName"] = { $regex: search, $options: "i" };
    }

    const docs = await Document.find(filter)
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
      data: docs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Single Document
 */
export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("uploadedByUser", "name email role")
      .populate("uploadedForUser", "name email role")
      .populate("kycDocumentId", "name code")
      .populate("complianceItemId", "name code validityDays");

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE Document (only meta)
 */
export const updateDocument = async (req, res) => {
  try {
    const { validFrom } = req.body;

    const doc = await Document.findById(req.params.id)
      .populate("complianceItemId", "validityDays");

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    let newFileMeta = null;

    // -------------------------------
    // CASE 1 → New file uploaded
    // -------------------------------
    if (req.file) {
      // Delete old file from local storage
      try {
        const oldPath = doc.file.filePath;
        if (oldPath) unlinkSync(oldPath);
      } catch (err) {
        console.log("Old file delete error:", err.message);
      }

      newFileMeta = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype.split("/")[1], // pdf, jpg, png
        storageProvider: "local",
      };

      doc.file = newFileMeta;
    }

    // ----------------------------------------------------
    // CASE 2 → Metadata updates (validFrom / validUntil)
    // ----------------------------------------------------

    if (doc.kycDocumentId) {
      // KYC has no expiry
      doc.validFrom = validFrom || doc.validFrom;
      doc.validUntil = null;
    }

    if (doc.complianceItemId) {
      if (validFrom) {
        const startDate = new Date(validFrom);
        const days = doc.complianceItemId.validityDays;

        doc.validFrom = startDate;
        doc.validUntil = new Date(
          startDate.getTime() + days * 24 * 60 * 60 * 1000
        );
      }
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: req.file
        ? "Document updated with new file"
        : "Document metadata updated",
      data: doc,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SOFT DELETE → moves to trash
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "trash" },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
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
 * REVIEW Document (approve / reject / expire)
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
      {
        status,
        reviewNotes: notes || "",
      },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
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

