import express from "express";
import { verifySession } from "../../middleware/sessionMiddleware.js";
import { authorizeAdminOrSuperAdmin } from "../../middleware/authAdminMiddleware.js";
import { getAllComplianceCategories } from "../../controllers/complianceCategoryController.js";

const router = express.Router();

router.get("/", verifySession, authorizeAdminOrSuperAdmin, getAllComplianceCategories);

export default router;
