import BusinessProfile from "../models/BusinessProfile.js";
import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";
import Document from "../models/Document.js";

/**
 * Calculate compliance score for a business (by business owner userId)
 *
 * @param {string} userId - MongoDB ObjectId of business owner
 * @returns {Promise<{
 *   score: number,
 *   totalRequired: number,
 *   fulfilled: number,
 *   missing: number,
 *   missingItems: Array,
 *   reason?: string
 * }>}
 */
export const calculateComplianceScoreForBusiness = async (userId) => {
  /* --------------------------------------------------
   * 1. Fetch business profile
   * -------------------------------------------------- */
  const businessProfile = await BusinessProfile.findOne({ userId })
    .select("businessTypeId")
    .lean();

  if (!businessProfile || !businessProfile.businessTypeId) {
    return {
      score: 0,
      totalRequired: 0,
      fulfilled: 0,
      missing: 0,
      missingItems: [],
      reason: "Business type not set",
    };
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

  const validMappings = mappings.filter(
    (m) => m.complianceItemId && m.complianceItemId.status === "active"
  );

  const requiredItemIds = validMappings.map((m) =>
    m.complianceItemId._id.toString()
  );

  // No mandatory requirements → fully compliant
  if (requiredItemIds.length === 0) {
    return {
      score: 100,
      totalRequired: 0,
      fulfilled: 0,
      missing: 0,
      missingItems: [],
    };
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

  const missingItemIds = requiredItemIds.filter((id) => !fulfilledSet.has(id));

  const missingItems = validMappings
    .filter((m) => missingItemIds.includes(m.complianceItemId._id.toString()))
    .map((m) => m.complianceItemId);

  /* --------------------------------------------------
   * 5. Calculate score
   * -------------------------------------------------- */
  const score = Math.round((fulfilled / totalRequired) * 100);

  return {
    score,
    totalRequired,
    fulfilled,
    missing,
    missingItems,
  };
};
