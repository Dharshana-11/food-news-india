import express from "express";
import { createSession, logoutSession } from "../controllers/sessionController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createSession);
router.get("/verify-session", verifySession, (req, res) => {
  res.json({ message: "Session is valid", user: req.user });
}); // verify active session token
router.post("/logout", logoutSession);

export default router;