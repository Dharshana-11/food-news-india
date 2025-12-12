import express from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import { verifySession } from "../middleware/sessionMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * Ticket Routes
 *
 * Features:
 * - View all tickets (Admin + Super Admin)
 * - View specific ticket by ID (Admin + Super Admin)
 * - Create ticket (Super Admin only)
 * - Update ticket status/details (Admin + Super Admin)
 * - Delete/archive ticket (Super Admin only)
 *
 * Every route requires `verifySession` before role-based authorization.
 *
 * @module TicketRoutes
 * @example
 * // Base URL:
 * // /api/tickets
 */

// GET All Tickets (Only Admin & Super Admin)
router.get(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  getTickets
);

// GET Ticket By ID (Only Admin & Super Admin)
router.get(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  getTicketById
);

// CREATE Ticket (Only Super Admin)
router.post(
  "/",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  upload.array("attachments", 5),
  createTicket
);

// UPDATE Ticket (Admin & Super Admin)
router.patch(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateTicket
);

// DELETE Ticket (Only Super Admin)
router.delete(
  "/:id",
  verifySession,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteTicket
);

export default router;
