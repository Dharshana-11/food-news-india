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
    }
}, {timestamps: true})

export default mongoose.model('UserSession',userSessionSchema);