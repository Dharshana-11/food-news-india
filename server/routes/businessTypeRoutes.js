import express from "express";
import {
  getAllBusinessTypes,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType
} from "../controllers/businessTypeController.js";
import ROLES from "../utils/constants/roles.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { verifySession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

// CRUD routes
router.get("/", verifySession, authorizeRoles(ROLES.SUPER_ADMIN), getAllBusinessTypes);
router.post("/", verifySession, authorizeRoles(ROLES.SUPER_ADMIN), createBusinessType);
router.put("/:id", verifySession, authorizeRoles(ROLES.SUPER_ADMIN), updateBusinessType);
router.delete("/:id", verifySession, authorizeRoles(ROLES.SUPER_ADMIN), deleteBusinessType);

export default router;
