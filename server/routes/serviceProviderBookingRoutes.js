import express from "express";
import * as spBookingController from "../controllers/serviceProviderBookingController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * SERVICE PROVIDER - BOOKINGS ROUTES
 * ============================================================
 */

// Middleware: Authentication & Authorization
router.use(verifySession);
router.use(authorizeRoles(ROLES.SERVICE_PROVIDER));

/**
 * Get booking requests (pending bookings)
 * GET /api/service-provider/bookings/requests
 * Query: ?search=text&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&complianceItemId=xxx
 */
router.get("/requests", spBookingController.getBookingRequests);

/**
 * Get booking statistics
 * GET /api/service-provider/bookings/stats
 */
router.get("/stats", spBookingController.getBookingStats);

/**
 * Get all my bookings (accepted, in_progress, documents_submitted)
 * GET /api/service-provider/bookings
 * Query: ?status=accepted&sortBy=bookedAt&sortOrder=desc&limit=20&page=1
 */
router.get("/", spBookingController.getMyBookings);

/**
 * Accept a booking request
 * PATCH /api/service-provider/bookings/:id/accept
 */
router.patch("/:id/accept", spBookingController.acceptBooking);

/**
 * Reject a booking request
 * PATCH /api/service-provider/bookings/:id/reject
 * Body: { reason: "string" }
 */
router.patch("/:id/reject", spBookingController.rejectBooking);

/**
 * Get booking details
 * GET /api/service-provider/bookings/:id
 */
router.get("/:id", spBookingController.getBookingById);

/**
 * Post a service update (timeline)
 * POST /api/service-provider/bookings/:id/update
 * Body: { message: "string", status?: "in_progress"|"documents_submitted"|"completed" }
 */
router.post("/:id/update", spBookingController.postServiceUpdate);

/**
 * Upload deliverables
 * POST /api/service-provider/bookings/:id/deliverables
 * Body: FormData with file + validFrom (optional)
 */
router.post(
  "/:id/deliverables",
  upload.single("file"),
  spBookingController.uploadDeliverables
);

export default router;
