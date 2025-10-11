import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve('server/.env') });
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

const seedSuperAdmin = async () => {
  try {
    const existing = await Admin.findOne({ uid: process.env.SUPER_ADMIN_UID }); //searches if super admin exists in collection
    if (existing) {
      console.log("Super Admin already exists");
      process.exit(); //If super admin exists, stop script
    }

    const admin = new Admin({
      uid: process.env.SUPER_ADMIN_UID,
      name: process.env.SUPER_ADMIN_NAME,
      role: "super-admin",
    });  //Create a new super admin document in the collection

    await admin.save();
    console.log("Super Admin created successfully");
    process.exit();
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
