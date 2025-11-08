import ComplianceCategory from "../models/ComplianceCategory.js";

// @desc Get all compliance categories
// @route GET /api/admin/compliance/categories
export const getAllComplianceCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 0;
  const search = req.query.search || "";

  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const categories = await ComplianceCategory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

// @desc Add new compliance category
// @route POST /api/admin/compliance/categories
export const addComplianceCategory = async (req, res) => {
  const { name, code, description, required, status, defaultValidityDays } = req.body;

  try {
    const existing = await ComplianceCategory.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = new ComplianceCategory({
      name,
      code,
      description,
      required,
      status,
      defaultValidityDays
    });

    await category.save();
    res.status(201).json({ message: "Category added successfully", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding category" });
  }
};

// @desc Update existing compliance category
// @route PUT /api/admin/compliance/categories/:id
export const updateComplianceCategory = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const category = await ComplianceCategory.findByIdAndUpdate(id, updates, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// @desc Delete compliance category (soft delete: set status=false)
// @route DELETE /api/admin/compliance/categories/:id
export const deleteComplianceCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await ComplianceCategory.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted (status set to inactive)", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};
