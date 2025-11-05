import mongoose from "mongoose";
import ROLES from "../utils/constants/roles.js";

/**
 * @typedef User
 * @property {String} uid - Unique identifier for the user (Firebase UID), required and unique
 * @property {String} [email] - User's email, unique if provided (required for admin/super_admin)
 * @property {String} [phone] - User's phone number, unique if provided (required for non-admin users)
 * @property {String} role - Role of the user. Enum: "business_owner", "agent", "service_provider", "admin", "super_admin"
 * @property {String} name - Full name of the user, required
 * @property {String} status - Verification status. Enum: "verified", "not verified". Default: "not verified"
 * @property {Date} createdAt - Timestamp of user creation (automatically added)
 * @property {Date} updatedAt - Timestamp of last update (automatically added)
 */

/**
 * User Schema
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness among documents that actually have this field
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required:true,
    },
    name: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    updatedBy: {
        type: String   // UID of user who last updated
    }, 
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

/**
 * Indexes
 */
userSchema.index({ role: 1 }); // ascending index on role field
userSchema.index({ status: 1 }); // ascending index on status field
userSchema.index({ name: "text" });
userSchema.index({ createdAt: -1 }); // descending for newest first
userSchema.index({ updatedAt: -1 });

userSchema.index({ role: 1, status: 1 }); // compound index for faster filtering
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ role: 1, status: 1, createdAt: -1 });


/**
 * User Model
 * @type {mongoose.Model<User>}
 */
export default mongoose.model("Users", userSchema);
