import ComplianceCategory from "../models/ComplianceCategory.js";

// @desc Get all compliance categories
// @route GET /api/super-admin/compliance-categories
// @access Admin / Super Admin
export const getAllComplianceCategories = async (req, res) => {
  const limit = parseInt(req.query.limit) || 0; // 0 = no limit
  const search = req.query.search || "";

  try {
    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const categories = await ComplianceCategory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};
