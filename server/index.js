/**
 * server.js
 * ------------------------------------------------------------
 * Entry point for the Express application.
 * Handles:
 * - MongoDB connection
 * - Middleware configuration (CORS, JSON parsing, cookies)
 * - Route setup for Auth, Session, and Super Admin
 * ------------------------------------------------------------
 */

import express, { json } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import complianceItemRoutes from "./routes/admin/complianceItemRoutes.js"
import businessTypeRoutes from "./routes/businessTypeRoutes.js"

// Load environment variables
dotenv.config();

const app = express();

/**
 * Middleware Configuration
 * ------------------------------------------------------------
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from frontend
    credentials: true, // Enable cookies / session handling
  }),
);

app.use(json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies in incoming requests

/**
 * MongoDB Connection
 * ------------------------------------------------------------
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/**
 * Route Handlers
 * ------------------------------------------------------------
 */
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/session", sessionRoutes); // Session management routes
app.use("/api/super-admin", superAdminRoutes); // Super Admin routes
app.use("/api/compliance-items", complianceItemRoutes);
app.use("/api/business-types", businessTypeRoutes);
/**
 * Server Startup
 * ------------------------------------------------------------
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
