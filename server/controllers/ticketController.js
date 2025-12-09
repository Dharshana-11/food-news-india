import Ticket from "../models/Ticket.js";
import NotificationToken from "../models/NotificationToken.js";
import sendNotification from "../utils/sendNotification.js";
import User from "../models/User.js";

/**
 * @file Ticket Controller
 * @description Handles all ticket-related operations including CRUD and notifications
 * @module controllers/ticketController
 */

/**
 * Get all tickets with optional filtering
 * @route GET /api/tickets
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of tickets
 */
export const getTickets = async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get a single ticket by ID
 * @route GET /api/tickets/:id
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Ticket ID
 * @param {Object} res - Express response object
 * @returns {Object} Ticket details
 */
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create a new ticket
 * @route POST /api/tickets
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Ticket data
 * @param {string} req.body.category - Ticket category
 * @param {string} req.body.priority - Ticket priority (low/medium/high)
 * @param {string} req.body.description - Ticket description
 * @param {Array} [req.body.attachments] - Optional array of attachments
 * @param {Object} req.user - Authenticated user
 * @param {string} req.user.uid - User ID
 * @param {string} req.user.name - User's name
 * @param {string} req.user.role - User's role
 * @param {Object} res - Express response object
 * @returns {Object} Created ticket
 */
export const createTicket = async (req, res) => {
  try {
    const count = await Ticket.countDocuments();

    const ticket = await Ticket.create({
      ticketId: `TCK-${count + 1}`,

      // 🔥 Automatically assign creator (super admin / admin / agent etc.)
      createdBy: {
        userId: req.user.uid,
        name: req.user.name,
        role: req.user.role
      },

      category: req.body.category,
      priority: req.body.priority,
      description: req.body.description,
      attachments: req.body.attachments || []
    });

    // 🔥 Notify admins
    await sendNotification({
      event: "ticket_created",
      payload: {
        ticketId: ticket.ticketId,
        title: ticket.category,
        createdBy: ticket.createdBy.name
      },
      target: { roles: ["admin", "super_admin"] }
    });

    res.status(201).json(ticket);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



//Update Ticket → Notify Owner
/**
 * Update an existing ticket and notify the owner
 * @route PUT /api/tickets/:id
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Ticket ID
 * @param {Object} req.body - Updated ticket data
 * @param {Object} res - Express response object
 * @returns {Object} Updated ticket
 */
export const updateTicket = async (req, res) => {
  try {
    const oldTicket = await Ticket.findById(req.params.id);
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    let message = null;

    if (req.body.status && req.body.status !== oldTicket.status) {
      message = `Ticket status updated to ${req.body.status}`;
    }
    if (req.body.priority && req.body.priority !== oldTicket.priority) {
      message = `Ticket priority updated to ${req.body.priority}`;
    }

    if (message) {
      await sendNotification({
        event: "ticket_updated",
        payload: {
          ticketId: updatedTicket.ticketId,
          message
        },
        target: { uid: updatedTicket.createdBy.userId }
      });
    }

    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * Soft delete a ticket and notify the owner
 * @route DELETE /api/tickets/:id
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Ticket ID
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    await sendNotification({
      event: "ticket_archived",
      payload: {
        ticketId: ticket.ticketId
      },
      target: { uid: ticket.userId }
    });

    res.json({ message: "Ticket archived successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all archived tickets
 * @route GET /api/tickets/archived
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of archived tickets
 */
export const getArchivedTickets = async (req, res) => {
  try {
    const archived = await Ticket.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(archived);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

