import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true, // Ensure UID is unique in the database
    },
    email: {
        type: String,
        required: function(){
            return this.role==="admin" || this.role==="super-admin"
        },
    },
    phone: {
        type: String,
        required: function(){
            return this.role!=="admin" && this.role!=="super-admin"
        },
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["food-business","agent","service-provider","admin","super-admin"],
        required: true
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

export default mongoose.model("User", userSchema);