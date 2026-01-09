import ServiceProvider from "../models/ServiceProvider.js";

/**
 * Validates Service Provider profile completeness for KYC
 * Throws Error if incomplete
 */
export const validateServiceProviderProfileForKYC = async (userId) => {
  const profile = await ServiceProvider.findOne({ userId });

  if (!profile) {
    throw new Error("Service Provider profile not found");
  }

  const missingFields = [];

  if (!profile.companyName) missingFields.push("companyName");
  if (!profile.location) missingFields.push("location");

  if (!profile.contactEmail && !profile.contactPhone) {
    missingFields.push("contactEmail/contactPhone");
  }

  if (!profile.gstNumber && !profile.businessRegistration) {
    missingFields.push("gstNumber/businessRegistration");
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Incomplete Service Provider profile. Missing: ${missingFields.join(", ")}`
    );
  }

  return profile;
};
