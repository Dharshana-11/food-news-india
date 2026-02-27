import express from "express";
import { verifySession } from "../middleware/sessionMiddleware.js";
import {
  serveDocumentInline,
  serveDocumentDownload,
} from "../controllers/fileController.js";

const router = express.Router();

// All file access requires login
router.get("/documents/:id", verifySession, serveDocumentInline);
router.get("/documents/:id/download", verifySession, serveDocumentDownload);

export default router;
