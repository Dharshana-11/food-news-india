require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

const seedSuperAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: "superadmin@foodpoint.com" });
    if (existing) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const admin = new Admin({
      name: "Super Admin",
      email: "superadmin@foodpoint.com",
      password: "Admin@123", // you can change
      role: "super-admin",
    });

    await admin.save();
    console.log("Super Admin created successfully");
    process.exit();
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
