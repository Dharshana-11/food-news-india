import BusinessProfile from "../models/BusinessProfile.js";
import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";
import Document from "../models/Document.js";
import ComplianceItem from "../models/ComplianceItem.js";

/**
 * Get compliance score for the logged-in business owner.
 *
 * Rules:
 * - Only mandatory compliance items (applicability = "required") are considered
 * - A compliance item is fulfilled if:
 *   - At least one document exists
 *   - Document status is "approved"
 *   - Document is not expired (validUntil is null or in the future)
 *
 * @route   GET /api/compliance/score
 * @access  Private (Business Owner)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export const getMyComplianceScore = async (req, res) => {
  try {
    const userId = req.user._id;

    /* --------------------------------------------------
     * 1. Fetch business profile
     * -------------------------------------------------- */
    const businessProfile = await BusinessProfile.findOne({ userId })
      .select("businessTypeId")
      .lean();

    if (!businessProfile || !businessProfile.businessTypeId) {
      return res.status(200).json({
        success: true,
        data: {
          score: 0,
          totalRequired: 0,
          fulfilled: 0,
          missing: 0,
          missingItems: [],
          reason: "Business type not set",
        },
      });
    }

    /* --------------------------------------------------
     * 2. Fetch mandatory compliance requirements
     * -------------------------------------------------- */
    const mappings = await ComplianceRequirementMapping.find({
      businessTypeId: businessProfile.businessTypeId,
      applicability: "required",
      status: "active",
    })
      .populate({
        path: "complianceItemId",
        select: "name code description status",
      })
      .lean();

    // Only include active compliance items
    const validMappings = mappings.filter(
      (m) => m.complianceItemId && m.complianceItemId.status === "active"
    );

    const requiredItemIds = validMappings.map((m) =>
      m.complianceItemId._id.toString()
    );

    // No mandatory requirements → fully compliant
    if (requiredItemIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          score: 100,
          totalRequired: 0,
          fulfilled: 0,
          missing: 0,
          missingItems: [],
        },
      });
    }

    /* --------------------------------------------------
     * 3. Fetch valid compliance documents
     * -------------------------------------------------- */
    const now = new Date();

    const validDocuments = await Document.find({
      uploadedForUser: userId,
      complianceItemId: { $in: requiredItemIds },
      status: "approved",
      $or: [{ validUntil: null }, { validUntil: { $gt: now } }],
    })
      .select("complianceItemId")
      .lean();

    /* --------------------------------------------------
     * 4. Deduplicate fulfilled compliance items
     * -------------------------------------------------- */
    const fulfilledSet = new Set(
      validDocuments.map((d) => d.complianceItemId.toString())
    );

    const fulfilled = fulfilledSet.size;
    const totalRequired = requiredItemIds.length;
    const missing = totalRequired - fulfilled;

    const missingItemIds = requiredItemIds.filter(
      (id) => !fulfilledSet.has(id)
    );

    const missingItems = validMappings
      .filter((m) => missingItemIds.includes(m.complianceItemId._id.toString()))
      .map((m) => m.complianceItemId);

    /* --------------------------------------------------
     * 5. Calculate score
     * -------------------------------------------------- */
    const score = Math.round((fulfilled / totalRequired) * 100);

    return res.status(200).json({
      success: true,
      data: {
        score,
        totalRequired,
        fulfilled,
        missing,
        missingItems,
      },
    });
  } catch (error) {
    console.error("Compliance score calculation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate compliance score",
    });
  }
};
