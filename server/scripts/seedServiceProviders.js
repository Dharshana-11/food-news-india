import mongoose from "mongoose";
import ServiceProvider from "../models/ServiceProvider.js";
import ComplianceItem from "../models/ComplianceItem.js";
import User from "../models/User.js";
import "dotenv/config";

const seedServiceProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all active compliance items
    const complianceItems = await ComplianceItem.find({ status: "active" });

    if (complianceItems.length === 0) {
      console.log(
        "No compliance items found. Please seed compliance items first."
      );
      process.exit(1);
    }

    console.log(`Found ${complianceItems.length} compliance items`);

    // Get admin user for verification
    const adminUser = await User.findOne({ role: "super_admin" });

    if (!adminUser) {
      console.log("No super admin found");
    }

    // Create sample service provider users first
    const providerUsers = [
      {
        uid: "provider_simba_001",
        name: "Simba Services",
        email: "simba@services.com",
        phone: "+919876543210",
        role: "service_provider",
        isVerified: true,
        status: "verified",
      },
      {
        uid: "provider_maxie_001",
        name: "Maxie Services",
        email: "maxie@services.com",
        phone: "+919876543211",
        role: "service_provider",
        isVerified: true,
        status: "verified",
      },
      {
        uid: "provider_legal_001",
        name: "Legal Services",
        email: "legal@services.com",
        phone: "+919876543212",
        role: "service_provider",
        isVerified: true,
        status: "verified",
      },
    ];

    // Clear existing provider users
    await User.deleteMany({ role: "service_provider" });
    const createdUsers = await User.insertMany(providerUsers);
    console.log(`Created ${createdUsers.length} service provider users`);

    // Clear existing service providers
    await ServiceProvider.deleteMany({});

    // Create service provider profiles
    const providers = [
      {
        userId: createdUsers[0]._id,
        companyName: "Simba Services",
        description:
          "Training, Compliance and Document Provider with 10+ years experience",
        complianceItemsOffered: complianceItems.map((c) => c._id),
        pricingPerItem: complianceItems.map((c) => ({
          complianceItemId: c._id,
          price: Math.floor(Math.random() * 1000) + 800, // Random price between 800-1800
          estimatedDays: c.name.includes("License") ? 7 : 5,
        })),
        location: "Chennai, Tamil Nadu",
        rating: 4.5,
        totalCustomers: 100,
        completedBookings: 95,
        status: "active",
        verifiedAt: new Date(),
        verifiedBy: adminUser?._id,
        specializations: ["FSSAI", "Compliance", "Training", "Documentation"],
        contactEmail: "simba@services.com",
        contactPhone: "+919876543210",
        gstNumber: "29ABCDE1234F1Z5",
      },
      {
        userId: createdUsers[1]._id,
        companyName: "Maxie Services",
        description:
          "Expert compliance and licensing services for food businesses",
        complianceItemsOffered: complianceItems.slice(
          0,
          Math.ceil(complianceItems.length / 2)
        ),
        pricingPerItem: complianceItems
          .slice(0, Math.ceil(complianceItems.length / 2))
          .map((c) => ({
            complianceItemId: c._id,
            price: Math.floor(Math.random() * 800) + 700, // Random price between 700-1500
            estimatedDays: c.name.includes("Test") ? 3 : 6,
          })),
        location: "Chennai, Tamil Nadu",
        rating: 4.8,
        totalCustomers: 150,
        completedBookings: 145,
        status: "active",
        verifiedAt: new Date(),
        verifiedBy: adminUser?._id,
        specializations: [
          "Licensing",
          "GST",
          "Trade License",
          "Fast Processing",
        ],
        contactEmail: "maxie@services.com",
        contactPhone: "+919876543211",
        gstNumber: "29XYZAB5678C1D2",
      },
      {
        userId: createdUsers[2]._id,
        companyName: "Legal Services",
        description:
          "Professional legal and documentation services with government liaisons",
        complianceItemsOffered: complianceItems.filter(
          (c) => c.name.includes("License") || c.name.includes("GST")
        ),
        pricingPerItem: complianceItems
          .filter((c) => c.name.includes("License") || c.name.includes("GST"))
          .map((c) => ({
            complianceItemId: c._id,
            price: Math.floor(Math.random() * 700) + 600, // Random price between 600-1300
            estimatedDays: 8,
          })),
        location: "Chennai, Tamil Nadu",
        rating: 4.6,
        totalCustomers: 80,
        completedBookings: 75,
        status: "active",
        verifiedAt: new Date(),
        verifiedBy: adminUser?._id,
        specializations: [
          "Legal",
          "Documentation",
          "Government Liaison",
          "Compliance",
        ],
        contactEmail: "legal@services.com",
        contactPhone: "+919876543212",
        gstNumber: "29PQRST9012E3F4",
      },
    ];

    const createdProviders = await ServiceProvider.insertMany(providers);
    console.log(`Created ${createdProviders.length} service providers`);

    console.log("\n=== Seeding Summary ===");
    console.log(`Service Provider Users: ${createdUsers.length}`);
    console.log(`Service Provider Profiles: ${createdProviders.length}`);
    console.log(`Compliance Items Available: ${complianceItems.length}`);

    console.log("\n=== Provider Details ===");
    createdProviders.forEach((provider, index) => {
      console.log(`\n${index + 1}. ${provider.companyName}`);
      console.log(
        `   - Services Offered: ${provider.complianceItemsOffered.length}`
      );
      console.log(`   - Rating: ${provider.rating} ⭐`);
      console.log(`   - Customers: ${provider.totalCustomers}`);
      console.log(`   - Status: ${provider.status}`);
    });

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedServiceProviders();
