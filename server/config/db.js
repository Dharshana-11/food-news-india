import { connect } from "mongoose";

/**
 * Establishes a connection to MongoDB using Mongoose
 * @module config/db
 * @requires mongoose
 */

/**
 * Connects to MongoDB using the provided MONGO_URI from environment variables
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is established
 * @throws {Error} If connection to MongoDB fails
 * @example
 * // In your main server file
 * import connectDB from './config/db';
 * await connectDB();
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
