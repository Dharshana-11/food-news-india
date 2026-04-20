/**
 * @file adminDashboardRoutes.js
 * @description Express router for Super Admin dashboard aggregation endpoints.
 *
 * Mount in server.js / app.js with:
 *   import dashboardRoutes from "./routes/dashboardRoutes.js";
 *   app.use("/api/admin/dashboard", dashboardRoutes);
 *
 * Access: ADMIN | SUPER_ADMIN only (enforced via middleware)
 */

import express from "express";
import {
  getDashboardStats,
  getComplianceOverview,
  getActivityData,
  getPendingVerifications,
  getServicesSummary,
  getTicketsSummary,
  getDashboardNotifications,
} from "../controllers/adminDashboardController.js";

import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import ROLES from "../utils/constants/roles.js";

const router = express.Router();

// ─── Apply auth middleware to every dashboard route ────────────────────────
router.use(verifySession, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

/**
 * @route  GET /api/admin/dashboard/stats
 * @desc   Top stat cards: businesses, agents, service providers, open tickets
 */
router.get("/stats", getDashboardStats);

/**
 * @route  GET /api/admin/dashboard/compliance
 * @desc   Donut chart: Compliant / Pending Review / Non-Compliant counts
 */
router.get("/compliance", getComplianceOverview);

/**
 * @route  GET /api/admin/dashboard/activity
 * @desc   Line chart: daily registrations + tickets for the last 7 days
 */
router.get("/activity", getActivityData);

/**
 * @route  GET /api/admin/dashboard/verifications
 * @desc   Pending verifications table (KYC docs awaiting review)
 */
router.get("/verifications", getPendingVerifications);

/**
 * @route  GET /api/admin/dashboard/services
 * @desc   Service summary widget: approved / under-review / inactive counts
 */
router.get("/services", getServicesSummary);

/**
 * @route  GET /api/admin/dashboard/tickets
 * @desc   Ticket snapshot: counts grouped by status
 */
router.get("/tickets", getTicketsSummary);

/**
 * @route  GET /api/admin/dashboard/notifications
 * @desc   Latest 6 notification log entries shaped for the widget
 */
router.get("/notifications", getDashboardNotifications);

export default router;
