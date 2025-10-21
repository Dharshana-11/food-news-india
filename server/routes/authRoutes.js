import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { verifyUser } from "../controllers/authController.js";

const router = express.Router();

router.get("/verify", authenticateUser, verifyUser); 
export default router;