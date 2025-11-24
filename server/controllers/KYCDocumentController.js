import KYCDocument from "../models/KYCDocument.js";

// Create KYC Document
export const createKycDocument = async (req, res) => {
  try {
    const { name, code, description, applicableRoles, status } = req.body;

    const userId = req.user?._id; // from httponly cookie middleware

    const newDoc = await KYCDocument.create({
      name,
      code,
      description,
      applicableRoles,
      status,
      createdBy: userId,
      updatedBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "KYC document created successfully",
      data: newDoc,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All (with pagination + search + status filter)
export const getKycDocuments = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Search by name or code
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }
    query.status = { $ne: "trash" };

    const total = await KYCDocument.countDocuments(query);

    const documents = await KYCDocument.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get by ID
export const getKycDocumentById = async (req, res) => {
  try {
    const doc = await KYCDocument.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update
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
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      message: "KYC document updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Change status (active → inactive → trash)
export const updateKycDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id;

    if (!["active", "inactive", "trash"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updated = await KYCDocument.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: userId, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete → move to trash (soft delete)
export const deleteKycDocument = async (req, res) => {
  try {
    const userId = req.user?._id;

    const deleted = await KYCDocument.findByIdAndUpdate(
      req.params.id,
      { status: "trash", updatedBy: userId, updatedAt: new Date() },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      message: "KYC document moved to trash",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
