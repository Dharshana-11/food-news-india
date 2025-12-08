import KYCDocument from "../models/KYCDocument.js";

/**
 * Create KYC Document
 * --------------------
 * Body: { name, code, description, applicableRoles, status }
 */
export const createKycDocument = async (req, res) => {
  try {
    const { name, code, description, applicableRoles, status } = req.body;
    const userId = req.user?._id; // from auth/session middleware

    const newDoc = await KYCDocument.create({
      name,
      code,
      description,
      applicableRoles,
      status,
      createdBy: userId,
      updatedBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "KYC document created successfully",
      data: newDoc,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All KYC Documents
 * Includes: pagination, search, status filter (except trash)
 * Query: ?page=1&limit=10&search=...&status=active
 */
export const getKycDocuments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status;

    const query = { status: { $ne: "trash" } };

    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { code: new RegExp(search, "i") },
      ];
    }

    // Status filter (active / inactive)
    if (status && status !== "trash") {
      query.status = status;
    }

    const total = await KYCDocument.countDocuments(query);

    const documents = await KYCDocument.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get KYC Document by ID
 */
export const getKycDocumentById = async (req, res) => {
  try {
    const doc = await KYCDocument.findById(req.params.id);

    if (!doc || doc.status === "trash") {
      return res.status(404).json({
        success: false,
        message: "KYC document not found",
      });
    }

    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update KYC Document
 */
export const updateKycDocument = async (req, res) => {
  try {
    const { name, code, description, applicableRoles, status } = req.body;
    const userId = req.user?._id;

    const updated = await KYCDocument.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        description,
        applicableRoles,
        status,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "KYC document not found",
      });
    }

    return res.json({
      success: true,
      message: "KYC document updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Status Only (active, inactive, trash)
 */
export const updateKycDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id;

    const allowed = ["active", "inactive", "trash"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updated = await KYCDocument.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "KYC document not found",
      });
    }

    return res.json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Soft Delete (Move to Trash)
 */
export const deleteKycDocument = async (req, res) => {
  try {
    const userId = req.user?._id;

    const deleted = await KYCDocument.findByIdAndUpdate(
      req.params.id,
      {
        status: "trash",
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "KYC document not found",
      });
    }

    return res.json({
      success: true,
      message: "KYC document moved to trash",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
