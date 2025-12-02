// scripts/seedKYCDocuments.js
import mongoose from "mongoose";
import KYCDocument from "../models/KYCDocument.js";
import ROLES from "../utils/constants/roles.js";
import "dotenv/config";

const ADMIN_ID = "65cfa9b3792fad8f204bfa11"; // any valid 24-char hex

const kycDocuments = [
  {
    name: "Aadhaar Card (Front)",
    code: "AADHAAR_FRONT",
    description: "Upload the front side of your Aadhaar card",
    applicableRoles: [ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER],
    status: "active",
    createdBy: ADMIN_ID, // Replace with actual admin ID
    updatedBy: ADMIN_ID,
  },
  {
    name: "Aadhaar Card (Back)",
    code: "AADHAAR_BACK",
    description: "Upload the back side of your Aadhaar card",
    applicableRoles: [ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER],
    status: "active",
    createdBy: ADMIN_ID,
    updatedBy: ADMIN_ID,
  },
  {
    name: "PAN Card",
    code: "PAN_CARD",
    description: "Upload your PAN card",
    applicableRoles: [ROLES.BUSINESS_OWNER],
    status: "active",
    createdBy: ADMIN_ID,
    updatedBy: ADMIN_ID,
  },
  {
    name: "FSSAI License",
    code: "FSSAI_LICENSE",
    description: "Upload your FSSAI license certificate",
    applicableRoles: [ROLES.BUSINESS_OWNER],
    status: "active",
    createdBy: ADMIN_ID,
    updatedBy: ADMIN_ID,
  },
  {
    name: "Passport Photo",
    code: "PASSPORT_PHOTO",
    description: "Upload a recent passport-size photograph",
    applicableRoles: [ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER],
    status: "active",
    createdBy: ADMIN_ID,
    updatedBy: ADMIN_ID,
  },
];

async function seedKYCDocuments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Clearing existing KYC documents...");
    await KYCDocument.deleteMany({});
    
    console.log("Seeding KYC documents...");
    await KYCDocument.insertMany(kycDocuments);
    
    console.log("✅ KYC documents seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding KYC documents:", error);
    process.exit(1);
  }
}

seedKYCDocuments();