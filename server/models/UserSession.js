import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        ref: "User" //references User model
    },
    login_time: {
        type: Date,
        default: Date.now
    },
    logout_time: {
        type: Date,
        default: null
    },
    is_active: {
        type: Boolean,
        default:true
    },
    sessionToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {timestamps: true})

userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('UserSession',userSessionSchema);