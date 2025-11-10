// name, code, desciprtion, status, sortOrder, timestamps

import mongoose from "mongoose";

const businessTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: ["active", "inactive", "trash"],
            default: "active"
        },
        sortOrder: {
            type: Number,
            default: 0
        }
    }, { timestamps: true }
);

export default mongoose.model("BusinessType", businessTypeSchema);