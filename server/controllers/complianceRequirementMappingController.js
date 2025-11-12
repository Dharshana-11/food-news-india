import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";

// Create or Update (Upsert)
export const upsertMapping = async (req, res) => {
  try {
    const { businessType, complianceItem, applicability } = req.body;

    if (!businessType || !complianceItem || !applicability) {
      return res.status(400).json({
        success: false,
        message: "businessType, complianceItem, and applicability are required.",
      });
    }

    const existing = await ComplianceRequirementMapping.findOne({
      businessType,
      complianceItem,
      status: { $ne: "trash" },
    });

    let result, message;

    if (existing) {
      existing.applicability = applicability;
      existing.updatedAt = new Date();
      result = await existing.save();
      message = "Mapping updated successfully";
    } else {
      result = await ComplianceRequirementMapping.create({
        businessType,
        complianceItem,
        applicability,
      });
      message = "Mapping created successfully";
    }

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });

  } catch (error) {
    console.error("Error in upsertMapping:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while upserting mapping.",
      error: error.message,
    });
  }
};
// Get all mappings (excluding deleted) with pagination, sorting, filtering, and search
export const getAllMappings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "updatedAt",
      order = "desc",
      applicability,
      businessType,
      complianceItem,
      search = ""
    } = req.query;

    const filter = { status: { $ne: "trash" } };

    if (applicability) filter.applicability = applicability;
    if (businessType) filter.businessType = businessType;
    if (complianceItem) filter.complianceItem = complianceItem;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Base query
    let query = ComplianceRequirementMapping.find(filter)
      .populate("businessType", "name code")
      .populate("complianceItem", "name code")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Fetch mappings
    const mappings = await query.lean();

    // 🔍 Search filter (on populated fields)
    const filteredResults = search
      ? mappings.filter((m) => {
          const searchLower = search.toLowerCase();
          return (
            m.businessType?.name?.toLowerCase().includes(searchLower) ||
            m.businessType?.code?.toLowerCase().includes(searchLower) ||
            m.complianceItem?.name?.toLowerCase().includes(searchLower) ||
            m.complianceItem?.code?.toLowerCase().includes(searchLower)
          );
        })
      : mappings;

    // Count (based on DB, not post-filter)
    const total = await ComplianceRequirementMapping.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Mappings fetched successfully",
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        results: filteredResults,
      },
    });
  } catch (error) {
    console.error("Error fetching mappings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching mappings.",
      error: error.message,
    });
  }
};


// Soft delete (mark status = "trash")
export const deleteMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await ComplianceRequirementMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    mapping.status = "trash";
    mapping.updatedAt = new Date();
    await mapping.save();

    return res.status(200).json({
      success: true,
      message: "Mapping moved to trash successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting mapping.",
      error: error.message,
    });
  }
};

// Get compliance grid for frontend
export const getComplianceGridByBusinessType = async (req, res) => {
  try {
    const { businessTypeId } = req.params;

    if (!businessTypeId) {
      return res.status(400).json({
        success: false,
        message: "businessTypeId is required"
      });
    }

    const complianceItems = await ComplianceItem.find({ status: { $ne: "trash" } }).lean();
    const mappings = await ComplianceRequirementMapping.find({
      businessTypeId,
      status: { $ne: "trash" }
    }).lean();

    const result = complianceItems.map((item) => {
      const existing = mappings.find(
        (m) => m.complianceItemId?.toString() === item._id.toString()
      );
      return {
        complianceItemId: item._id,
        complianceItemName: item.name,
        complianceItemCode: item.code,
        applicability: existing ? existing.applicability : "required",
        mappingId: existing?._id || null
      };
    });

    return res.status(200).json({
      success: true,
      message: "Compliance grid generated successfully",
      data: {
        businessTypeId,
        rules: result
      }
    });
  } catch (error) {
    console.error("Grid generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate compliance grid",
      error: error.message
    });
  }
};
