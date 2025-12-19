import express from "express";
import * as serviceBookingController from "../controllers/serviceBookingController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

// All routes require authentication
router.use(verifySession);

// Create booking (business owners only)
router.post(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.createBooking
);

// Get my bookings (BO & Service Provider)
router.get(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getMyBookings
);

// Get booking statistics (BO & Service Provider)
router.get(
  "/stats",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getBookingStats
);

// Update booking status (BO & Service Provider)
router.patch(
  "/:id/status",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.updateBookingStatus
);

// Cancel booking (Business Owner only)
router.patch(
  "/:id/cancel",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.cancelBooking
);

// Add rating (Business Owner only)
router.post(
  "/:id/rating",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.addRating
);

// Get booking details (BO, Provider, Admin)
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
