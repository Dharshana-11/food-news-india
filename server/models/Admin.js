import mongoose from "mongoose";
const {model, Schema} = mongoose;

const adminSchema = new Schema(
    {
        uid: { //Firebase user UID that helps match a verified token to a DB record.
            type: String,
            required: true,
            unique: true //unique at DB level
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'admin',
            enum: {
                values: ['admin', 'super-admin'], //enum validation so typos/case mismatch doesn't occur
                message: '{VALUE} not supported'
            }
        }
    }, {
        timestamps: true //timestamps for auditing
    }
)

const Admin = model('Admin', adminSchema);
export default Admin;