import ComplianceItem from "../models/ComplianceItem.js";

// @desc Get all compliance items
// @route GET /api/compliance-items
export const getAllComplianceItems = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 0, status } = req.query;
    const query = {};

    // Filter by status if provided, otherwise exclude trash
    query.status = status ? status : { $ne: "trash" };

    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = limit ? (parseInt(page) - 1) * parseInt(limit) : 0;

    const [totalCount, complianceItems] = await Promise.all([
      ComplianceItem.countDocuments(query),
      ComplianceItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ]);

    res.status(200).json({
      success: true,
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      data: complianceItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching compliance items" });
  }
};

// @desc Add new compliance item
// @route POST /api/compliance-items
export const addComplianceItem = async (req, res) => {
  try {
    let { name, code, description = "", ruleExpression = "", status = "active" } = req.body;

    // Trim strings
    name = name?.trim();
    code = code?.trim()?.toUpperCase();

    // Validate status
    if (!["active", "inactive", "trash"].includes(status)) status = "active";

    // Check if name or code already exists
    const existing = await ComplianceItem.findOne({
      $or: [{ name }, { code }]
    });
    if (existing) return res.status(400).json({ message: "Compliance item with this name or code already exists" });

    const complianceItem = new ComplianceItem({
      name,
      code,
      description,
      ruleExpression,
      status
    });

    await complianceItem.save();
    res.status(201).json({ message: "Compliance item added successfully", complianceItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding compliance item" });
  }
};

// @desc Update existing compliance item
// @route PUT /api/compliance-items/:id
export const updateComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Trim strings if present
    if (updates.name) updates.name = updates.name.trim();
    if (updates.code) updates.code = updates.code.trim().toUpperCase();

    // Validate status
    if (updates.status && !["active", "inactive", "trash"].includes(updates.status)) {
      updates.status = "active";
    }

    const complianceItem = await ComplianceItem.findByIdAndUpdate(id, updates, { new: true });

    if (!complianceItem) return res.status(404).json({ message: "Compliance item not found" });

    res.status(200).json({ message: "Compliance item updated successfully", complianceItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating compliance item" });
  }
};

// @desc Delete compliance item (soft delete: set status=trash)
// @route DELETE /api/compliance-items/:id
export const deleteComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;

    const complianceItem = await ComplianceItem.findByIdAndUpdate(
      id,
      { status: "trash" },
      { new: true }
    );

    if (!complianceItem) return res.status(404).json({ message: "Compliance item not found" });

    res.status(200).json({ message: "Compliance item deleted (status set to trash)", complianceItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting compliance item" });
  }
};
