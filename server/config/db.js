import { connect } from "mongoose";

/**
 * Connect to MongoDB using Mongoose.
 * MONGO_URI should be stored in .env for security.
 */
const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
