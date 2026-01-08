import express from "express";
import * as serviceBookingController from "../controllers/serviceBookingController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { authorizeAgentForBusiness } from "../middleware/authorizeAgentForBusiness.js";
import { loadBooking } from "../middleware/loadBooking.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * Service Booking Routes
 * -----------------------------------------------------------------------------
 * All routes:
 * - Require authentication
 * - Role-based access
 * - Agent delegation enforced via middleware
 */

router.use(verifySession);

/**
 * Create a new booking
 * POST /api/bookings
 * Access: Business Owner, Agent
 */
router.post(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT),
  authorizeAgentForBusiness((req) => req.body.businessOwnerId),
  serviceBookingController.createBooking
);

/**
 * Booking statistics
 * GET /api/bookings/stats
 * Access: Business Owner, Agent, Service Provider
 */
router.get(
  "/stats",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getBookingStats
);

/**
 * Get bookings for current user
 * GET /api/bookings
 * Access: Business Owner, Agent, Service Provider
 */
router.get(
  "/",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER),
  serviceBookingController.getMyBookings
);

/**
 * Update booking status
 * PATCH /api/bookings/:id/status
 * Access: Business Owner, Agent, Service Provider
 */
router.patch(
  "/:id/status",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT, ROLES.SERVICE_PROVIDER),
  loadBooking,
  authorizeAgentForBusiness((req) => req.booking.businessOwnerId),
  serviceBookingController.updateBookingStatus
);

/**
 * Cancel a booking
 * PATCH /api/bookings/:id/cancel
 * Access: Business Owner, Agent
 */
router.patch(
  "/:id/cancel",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT),
  loadBooking,
  authorizeAgentForBusiness((req) => req.booking.businessOwnerId),
  serviceBookingController.cancelBooking
);

/**
 * Add rating to completed booking
 * POST /api/bookings/:id/rating
 * Access: Business Owner, Agent
 */
router.post(
  "/:id/rating",
  authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.AGENT),
  loadBooking,
  authorizeAgentForBusiness((req) => req.booking.businessOwnerId),
  serviceBookingController.addRating
);

/**
 * Get booking details by ID
 * GET /api/bookings/:id
 * Access: Business Owner, Agent, Service Provider, Admin, Super Admin
 */
router.get(
  "/:id",
  authorizeRoles(
    ROLES.BUSINESS_OWNER,
    ROLES.AGENT,
    ROLES.SERVICE_PROVIDER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ),
  loadBooking,
  authorizeAgentForBusiness((req) => req.booking.businessOwnerId),
  serviceBookingController.getBookingById
);

export default router;
