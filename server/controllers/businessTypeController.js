import BusinessType from "../models/BusinessType.js";

/**
 * @desc    Get all business types (with search, pagination, and status filter)
 * @route   GET /api/business-types
 * @access  Admin / Super Admin
 */
export const getAllBusinessTypes = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 0, status } = req.query;

    const query = {
      status: status || { $ne: "trash" },
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = limit ? (parseInt(page) - 1) * parseInt(limit) : 0;

    const [totalCount, businessTypes] = await Promise.all([
      BusinessType.countDocuments(query),
      BusinessType.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
    ]);

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      data: businessTypes,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while fetching business types" });
  }
};

/**
 * @desc    Create a new business type
 * @route   POST /api/business-types
 * @access  Admin / Super Admin
 */
export const createBusinessType = async (req, res) => {
  try {
    let { name, code, description = "", status = "active", sortOrder = 0 } =
      req.body;

    name = name?.trim();
    code = code?.trim()?.toUpperCase();

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    if (!["active", "inactive", "trash"].includes(status)) {
      status = "active";
    }

    const existing = await BusinessType.findOne({
      $or: [{ name }, { code }],
    });

    if (existing) {
      return res.status(400).json({
        message: "Business type with this name or code already exists",
      });
    }

    const businessType = new BusinessType({
      name,
      code,
      description,
      status,
      sortOrder,
    });

    await businessType.save();

    return res.status(201).json({
      success: true,
      message: "Business type added successfully",
      data: businessType,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while adding business type" });
  }
};

/**
 * @desc    Update a business type by ID
 * @route   PUT /api/business-types/:id
 * @access  Admin / Super Admin
 */
export const updateBusinessType = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) updates.name = updates.name.trim();
    if (updates.code) updates.code = updates.code.trim().toUpperCase();

    if (
      updates.status &&
      !["active", "inactive", "trash"].includes(updates.status)
    ) {
      updates.status = "active";
    }

    const businessType = await BusinessType.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!businessType) {
      return res.status(404).json({ message: "Business type not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Business type updated successfully",
      data: businessType,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while updating business type" });
  }
};

/**
 * @desc    Soft delete a business type (sets status="trash")
 * @route   DELETE /api/business-types/:id
 * @access  Admin / Super Admin
 */
export const deleteBusinessType = async (req, res) => {
  try {
    const { id } = req.params;

    const businessType = await BusinessType.findByIdAndUpdate(
      id,
      { status: "trash" },
      { new: true }
    );

    if (!businessType) {
      return res.status(404).json({ message: "Business type not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Business type deleted successfully (status set to trash)",
      data: businessType,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error while deleting business type" });
  }
};
