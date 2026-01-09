import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import KYCProfile from "../models/KYCProfile.js";
import User from "../models/User.js";
import ServiceProvider from "../models/ServiceProvider.js";
import ROLES from "../utils/constants/roles.js";

/**
 * Check if all required KYC docs are approved
 * and update KYC + role state accordingly
 *
 * This function MUST be idempotent
 * This function MUST NOT depend on admin identity
 */
export async function checkAndUpdateUserVerification(userId, userRole) {
  // 1️. Fetch required KYC documents for role
  const requiredKycDocs = await KYCDocument.find({
    applicableRoles: userRole,
    status: "active",
  }).select("_id");

  if (requiredKycDocs.length === 0) return;

  // 2️. Fetch ONLY approved user KYC documents
  const approvedDocs = await Document.find({
    uploadedForUser: userId,
    kycDocumentId: { $ne: null },
    status: "approved",
  }).select("kycDocumentId");

  // 3️. Check if every required doc is approved
  const approvedDocIds = new Set(
    approvedDocs.map((d) => d.kycDocumentId.toString())
  );

  const allApproved = requiredKycDocs.every((doc) =>
    approvedDocIds.has(doc._id.toString())
  );

  if (!allApproved) return;

  // 4️. Mark KYCProfile as verified
  await KYCProfile.findOneAndUpdate(
    { userId },
    {
      kycStatus: "verified",
      kycProgress: 100,
      verifiedAt: new Date(),
    },
    { upsert: true }
  );

  // 5️. Update User (authoritative verification flag)
  await User.findByIdAndUpdate(userId, {
    isVerified: true,
    status: "verified",
  });

  // 6️. Role-specific activation
  if (userRole === ROLES.SERVICE_PROVIDER) {
    await ServiceProvider.findOneAndUpdate(
      { userId },
      {
        status: "active",
        verifiedAt: new Date(),
      }
    );
  }

  console.log(`[KYC] User ${userId} fully verified`);
}
