import { calculateComplianceScoreForBusiness } from "../services/complianceScoreService.js";

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
    const data = await calculateComplianceScoreForBusiness(req.user._id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Compliance score calculation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate compliance score",
    });
  }
};
