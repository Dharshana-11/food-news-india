import Document from "../models/Document.js";
import KYCDocument from "../models/KYCDocument.js";
import KYCProfile from "../models/KYCProfile.js";
import User from "../models/User.js";

/**
 * Check if all required KYC docs are approved
 * and update KYCProfile accordingly
 */
export async function checkAndUpdateUserVerification(userId, userRole) {
  const requiredKycDocs = await KYCDocument.find({
    applicableRoles: userRole,
    status: "active",
  });

  if (requiredKycDocs.length === 0) return;

  const uploadedDocs = await Document.find({
    uploadedForUser: userId,
    kycDocumentId: { $ne: null },
    status: { $nin: ["trash"] },
  });

  const allApproved = requiredKycDocs.every((requiredDoc) =>
    uploadedDocs.some(
      (uploadedDoc) =>
        uploadedDoc.kycDocumentId.toString() === requiredDoc._id.toString() &&
        uploadedDoc.status === "approved"
    )
  );

  if (!allApproved) return;

  await KYCProfile.findOneAndUpdate(
    { userId },
    {
      kycStatus: "verified",
      kycProgress: 100,
      verifiedAt: new Date(),
    },
    { upsert: true }
  );

  await User.findByIdAndUpdate(userId, { isVerified: true });

  console.log(`User ${userId} fully KYC verified`);
}
