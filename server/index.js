import express, { json } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from './routes/sessionRoutes.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Allow cross-origin requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, // for cookies/session
  }),
);

app.use(json());

app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes); //Routes for authentication
app.use("/api/session", sessionRoutes); //Routes for session management
app.use("/api/super-admin", superAdminRoutes); //Super-Admin Routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


