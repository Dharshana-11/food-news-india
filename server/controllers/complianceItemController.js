import ComplianceItem from "../models/ComplianceItem.js";

/**
 * @desc    Get all compliance items (with search, pagination, and status filter)
 * @route   GET /api/compliance-items
 * @access  Admin / Super Admin
 */
export const getAllComplianceItems = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 0, status } = req.query;

    const query = {
      status: status || { $ne: "trash" },
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = limit ? (parseInt(page) - 1) * parseInt(limit) : 0;

    const [totalCount, complianceItems] = await Promise.all([
      ComplianceItem.countDocuments(query),
      ComplianceItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
    ]);

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      data: complianceItems,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while fetching compliance items",
    });
  }
};

/**
 * @desc    Add a new compliance item
 * @route   POST /api/compliance-items
 * @access  Admin / Super Admin
 */
export const addComplianceItem = async (req, res) => {
  try {
    let {
      name,
      code,
      description = "",
      ruleExpression = "",
      status = "active",
      validityDays,
    } = req.body;

    name = name?.trim();
    code = code?.trim()?.toUpperCase();

    if (!name || !code) {
      return res
        .status(400)
        .json({ message: "Name and code are required" });
    }

    if (!["active", "inactive", "trash"].includes(status)) {
      status = "active";
    }

    if (!validityDays || isNaN(validityDays) || validityDays < 1) {
      return res.status(400).json({
        message: "validityDays must be a number greater than 0",
      });
    }

    const existing = await ComplianceItem.findOne({
      $or: [{ name }, { code }],
    });

    if (existing) {
      return res.status(400).json({
        message:
          "Compliance item with this name or code already exists",
      });
    }

    const complianceItem = new ComplianceItem({
      name,
      code,
      description,
      ruleExpression,
      status,
      validityDays,
    });

    await complianceItem.save();

    return res.status(201).json({
      success: true,
      message: "Compliance item added successfully",
      data: complianceItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while adding compliance item",
    });
  }
};

/**
 * @desc    Update an existing compliance item
 * @route   PUT /api/compliance-items/:id
 * @access  Admin / Super Admin
 */
export const updateComplianceItem = async (req, res) => {
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

    if (updates.validityDays !== undefined) {
      if (isNaN(updates.validityDays) || updates.validityDays < 1) {
        return res.status(400).json({
          message: "validityDays must be a number greater than 0",
        });
      }
    }

    const complianceItem = await ComplianceItem.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!complianceItem) {
      return res
        .status(404)
        .json({ message: "Compliance item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Compliance item updated successfully",
      data: complianceItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while updating compliance item",
    });
  }
};

/**
 * @desc    Soft delete a compliance item (sets status="trash")
 * @route   DELETE /api/compliance-items/:id
 * @access  Admin / Super Admin
 */
export const deleteComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const complianceItem = await ComplianceItem.findByIdAndUpdate(
      id,
      { status: "trash" },
      { new: true }
    );

    if (!complianceItem) {
      return res
        .status(404)
        .json({ message: "Compliance item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Compliance item deleted (status set to trash)",
      data: complianceItem,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while deleting compliance item",
    });
  }
};
