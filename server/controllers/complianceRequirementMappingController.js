import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";
import ComplianceItem from "../models/ComplianceItem.js";

/**
 * Create or update a compliance requirement mapping (Upsert).
 * @route POST /api/mappings
 */
export const upsertMapping = async (req, res) => {
  try {
    const { businessTypeId, complianceItemId, applicability } = req.body;

    if (!businessTypeId || !complianceItemId || !applicability) {
      return res.status(400).json({
        success: false,
        message:
          "businessTypeId, complianceItemId, and applicability are required.",
      });
    }

    const existing = await ComplianceRequirementMapping.findOne({
      businessTypeId,
      complianceItemId,
      status: { $ne: "trash" },
    });

    let result;
    let message;

    if (existing) {
      existing.applicability = applicability;
      existing.updatedBy = req.user._id;
      existing.updatedAt = new Date();

      result = await existing.save();
      message = "Mapping updated successfully";
    } else {
      result = await ComplianceRequirementMapping.create({
        businessTypeId,
        complianceItemId,
        applicability,
        createdBy: req.user._id,
        updatedBy: req.user._id,
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

/**
 * Get all requirement mappings with pagination + filtering + search.
 * @route GET /api/mappings
 */
export const getAllMappings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "updatedAt",
      order = "desc",
      applicability,
      businessTypeId,
      complianceItemId,
      search = "",
    } = req.query;

    const filter = { status: { $ne: "trash" } };

    if (applicability) filter.applicability = applicability;
    if (businessTypeId) filter.businessTypeId = businessTypeId;
    if (complianceItemId) filter.complianceItemId = complianceItemId;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const mappings = await ComplianceRequirementMapping.find(filter)
      .populate("businessTypeId", "name code")
      .populate("complianceItemId", "name code")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const filteredResults =
      search.trim() !== ""
        ? mappings.filter((m) => {
            const s = search.toLowerCase();
            return (
              m.businessTypeId?.name?.toLowerCase().includes(s) ||
              m.businessTypeId?.code?.toLowerCase().includes(s) ||
              m.complianceItemId?.name?.toLowerCase().includes(s) ||
              m.complianceItemId?.code?.toLowerCase().includes(s)
            );
          })
        : mappings;

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

/**
 * Soft delete (move mapping to trash)
 * @route DELETE /api/mappings/:id
 */
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
    mapping.updatedBy = req.user._id;

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

/**
 * Generate a grid of compliance items + applicability for a BusinessType
 * @route GET /api/mappings/grid/:businessTypeId
 */
export const getComplianceGridByBusinessType = async (req, res) => {
  try {
    const { businessTypeId } = req.params;

    if (!businessTypeId) {
      return res.status(400).json({
        success: false,
        message: "businessTypeId is required",
      });
    }

    const complianceItems = await ComplianceItem.find({
      status: { $ne: "trash" },
    }).lean();

    const mappings = await ComplianceRequirementMapping.find({
      businessTypeId,
      status: { $ne: "trash" },
    }).lean();

    const grid = complianceItems.map((item) => {
      const found = mappings.find(
        (m) => m.complianceItemId?.toString() === item._id.toString(),
      );

      return {
        complianceItemId: item._id,
        complianceItemName: item.name,
        complianceItemCode: item.code,
        applicability: found ? found.applicability : "not_applicable",
        mappingId: found?._id || null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Compliance grid generated successfully",
      data: {
        businessTypeId,
        rules: grid,
      },
    });
  } catch (error) {
    console.error("Grid generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate compliance grid",
      error: error.message,
    });
  }
};
