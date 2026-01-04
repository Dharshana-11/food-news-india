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
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import complianceItemRoutes from "./routes/admin/complianceItemRoutes.js";
import businessTypeRoutes from "./routes/businessTypeRoutes.js";
import complianceRequirementMappingRoutes from "./routes/complianceRequirementMappingRoutes.js";
import kycDocumentRoutes from "./routes/kycDocumentRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import documentVaultRoutes from "./routes/documentVaultRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceBookingRoutes from "./routes/serviceBookingRoutes.js";
import complianceScoreRoutes from "./routes/complianceScoreRoutes.js";
import agentInviteRoutes from "./routes/agentInviteRoutes.js";

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
  })
);

app.use(express.json());
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
app.use("/api/tickets", ticketRoutes); // Ticket management routes
app.use("/api/notifications", notificationRoutes);

//User Routes
app.use("/api/users", userRoutes);

app.use("/api/compliance-items", complianceItemRoutes);
app.use("/api/business-types", businessTypeRoutes);
app.use("/api/admin/compliance-mappings", complianceRequirementMappingRoutes);
app.use("/api/kyc-documents", kycDocumentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/kyc", kycRoutes); // Register KYC routes
app.use("/api/business-owner/documents", documentVaultRoutes);

app.use("/api/services", serviceRoutes);
app.use("/api/bookings", serviceBookingRoutes);
app.use("/api/compliance-score", complianceScoreRoutes);

app.use("/api/agents", agentRoutes);
app.use("/api/agent-invites", agentInviteRoutes);
app.use("/api/agent/businesses", agentBusinessRoutes);

/**
 * Server Startup
 * ------------------------------------------------------------
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
