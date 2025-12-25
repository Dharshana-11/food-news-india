import express from "express";
import * as serviceBookingController from "../controllers/serviceBookingController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * Service Booking Routes
 * -----------------------------------------------------------------------------
 * All routes:
 * - Require authentication
 * - Enforce role-based access per endpoint
 */

// Authentication middleware (global)
router.use(verifySession);

/**
 * Create a new booking
 * POST /api/bookings
 * Access: Business Owner
 */
router.post(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.createBooking
);

/**
 * Booking statistics
 * GET /api/bookings/stats
 * Access: Business Owner, Service Provider
 */
router.get(
  "/stats",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getBookingStats
);

/**
 * Get bookings for current user
 * GET /api/bookings
 * Access: Business Owner, Service Provider
 */
router.get(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getMyBookings
);

/**
 * Update booking status
 * PATCH /api/bookings/:id/status
 * Access: Business Owner, Service Provider
 */
router.patch(
  "/:id/status",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.SERVICE_PROVIDER),
  serviceBookingController.updateBookingStatus
);

/**
 * Cancel a booking
 * PATCH /api/bookings/:id/cancel
 * Access: Business Owner only
 */
router.patch(
  "/:id/cancel",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.cancelBooking
);

/**
 * Add rating to completed booking
 * POST /api/bookings/:id/rating
 * Access: Business Owner only
 */
router.post(
  "/:id/rating",
  authorizeRoles(ROLES.BUSINESS_OWNER),
  serviceBookingController.addRating
);

/**
 * Get booking details by ID
 * GET /api/bookings/:id
 * Access: Business Owner, Service Provider, Admin, Super Admin
 */
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
