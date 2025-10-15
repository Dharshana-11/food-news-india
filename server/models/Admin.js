import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true, // Ensure UID is unique in the database
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique in the database
  },
  role: {
    type: String,
    enum: ["admin", "super-admin"],
    default: "admin",
  },
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("Admin", AdminSchema);
