import express from "express";
import * as serviceBookingController from "../controllers/serviceBookingController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

// All routes require authentication
router.use(verifySession);

// Create booking (Business Owner)
router.post(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.createBooking
);

// 🔹 STATIC ROUTES FIRST
router.get(
  "/stats",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getBookingStats
);

// 🔹 COLLECTION ROUTE
router.get(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getMyBookings
);

// 🔹 SEMI-DYNAMIC
router.patch(
  "/:id/status",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.updateBookingStatus
);

router.patch(
  "/:id/cancel",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.cancelBooking
);

router.post(
  "/:id/rating",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.addRating
);

// 🔹 FULLY DYNAMIC — ALWAYS LAST
router.get(
  "/:id",
  authorizeRoles(
    ROLES.BUSINESS_OWNER,
    ROLES.SERVICE_PROVIDER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ),
  serviceBookingController.getBookingById
);

export default router;
