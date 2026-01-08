import ServiceBooking from "../models/ServiceBooking.js";
import ComplianceItem from "../models/ComplianceItem.js";
import ServiceProvider from "../models/ServiceProvider.js";
import User from "../models/User.js";
import { getAgentBusinessOwnerIds } from "../services/agentBusinessAccess.service.js";
import ROLES from "../utils/constants/roles.js";

/**
 * Create a new booking
 *
 * @route   POST /api/bookings
 * @body    { complianceItemId, providerId, agreedPrice?, estimatedDays?, notes? }
 * @access  Business Owner, Agent
 */
export const createBooking = async (req, res) => {
  try {
    const {
      complianceItemId,
      providerId,
      agreedPrice,
      estimatedDays,
      notes,
      businessOwnerId: requestedBusinessOwnerId,
    } = req.body;

    // Resolve Mongo user from Firebase session
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    let businessOwnerId;

    // AGENT FLOW (authorization already done in middleware)
    if (req.user.role === ROLES.AGENT) {
      if (!requestedBusinessOwnerId) {
        return res.status(400).json({
          success: false,
          message: "Business selection required for agents",
        });
      }

      businessOwnerId = requestedBusinessOwnerId;
    }

    // BUSINESS OWNER FLOW
    else if (req.user.role === ROLES.BUSINESS_OWNER) {
      businessOwnerId = user._id;
    }

    if (!businessOwnerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create booking",
      });
    }

    // Fetch compliance item and provider
    const [complianceItem, provider] = await Promise.all([
      ComplianceItem.findById(complianceItemId),
      ServiceProvider.findById(providerId),
    ]);

    if (!complianceItem || complianceItem.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (!provider || provider.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Resolve pricing
    const pricing = provider.pricingPerItem.find(
      (p) => p.complianceItemId.toString() === complianceItemId
    );

    const finalPrice = agreedPrice ?? pricing?.price;
    const finalDays = estimatedDays ?? pricing?.estimatedDays;

    // Calculate expected completion date
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(
      expectedCompletionDate.getDate() + finalDays
    );

    // Create booking
    const booking = await ServiceBooking.create({
      businessOwnerId,
      createdBy: user._id,
      complianceItemId,
      providerId,
      agreedPrice: finalPrice,
      estimatedDays: finalDays,
      expectedCompletionDate,
      notes,
      timeline: [
        {
          status: "pending",
          message:
            req.user.role === ROLES.AGENT
              ? "Booking created by agent on behalf of business"
              : "Booking request submitted",
          updatedBy: user._id,
        },
      ],
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/**
 * Get bookings for current user
 *
 * @route   GET /api/bookings
 * @query   { status, businessOwnerId?, sortBy, sortOrder, limit, page }
 */
export const getMyBookings = async (req, res) => {
  try {
    const {
      status,
      businessOwnerId: filterBusinessOwnerId,
      sortBy = "bookedAt",
      sortOrder = "desc",
      limit = 20,
      page = 1,
    } = req.query;

    const userId = req.user._id;
    const userRole = req.user.role;

    const query = {};

    /**
     * AGENT FLOW
     */
    if (userRole === ROLES.AGENT) {
      const authorizedBusinessOwnerIds = await getAgentBusinessOwnerIds(userId);

      if (authorizedBusinessOwnerIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: Number(limit),
            totalPages: 0,
          },
        });
      }

      if (filterBusinessOwnerId) {
        const isAllowed = authorizedBusinessOwnerIds.some(
          (id) => id.toString() === filterBusinessOwnerId
        );

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: "Not authorized to view this business",
          });
        }

        query.businessOwnerId = filterBusinessOwnerId;
      } else {
        query.businessOwnerId = { $in: authorizedBusinessOwnerIds };
      }
    } else if (userRole === ROLES.BUSINESS_OWNER) {
      /**
       * BUSINESS OWNER FLOW
       */
      query.businessOwnerId = userId;
    } else if (userRole === ROLES.SERVICE_PROVIDER) {
      /**
       * SERVICE PROVIDER FLOW
       */
      const provider = await ServiceProvider.findOne({ userId }).select("_id");

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Service provider profile not found",
        });
      }

      query.providerId = provider._id;
    }

    /**
     * STATUS FILTER
     */
    if (status) {
      query.status = status;
    }

    /**
     * PAGINATION & SORT
     */
    const parsedLimit = Number(limit);
    const parsedPage = Number(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const sortOptions = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [bookings, total] = await Promise.all([
      ServiceBooking.find(query)
        .populate("complianceItemId", "name code description validityDays")
        .populate("providerId", "companyName rating logo")
        .populate("businessOwnerId", "name phone")
        .populate("createdBy", "name role")
        .sort(sortOptions)
        .limit(parsedLimit)
        .skip(skip)
        .lean(),
      ServiceBooking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
/**
 * Get booking details by ID
 *
 * @route   GET /api/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.booking._id)
      .populate("complianceItemId")
      .populate({
        path: "providerId",
        select: "companyName rating logo userId",
      })
      .populate("businessOwnerId", "name phone email")
      .populate("createdBy", "name role")
      .populate("timeline.updatedBy", "name")
      .populate("documents.uploadedBy", "name")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const isOwner = booking.businessOwnerId?._id?.toString() === userId;
    const isProvider = booking.providerId?.userId?.toString() === userId;
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole);

    // Final authorization check (agent already validated by middleware)
    if (!isOwner && !isProvider && !isAdmin && userRole !== ROLES.AGENT) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

/**
 * Update booking status
 *
 * @route   PATCH /api/bookings/:id/status
 * @body    { status, message? }
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = req.booking; // loaded by loadBooking middleware

    /**
     * OWNERSHIP / PROVIDER CHECK
     * (Agent already validated by middleware)
     */
    const isOwner = booking.businessOwnerId.toString() === userId.toString();

    let isProvider = false;
    if (userRole === ROLES.SERVICE_PROVIDER) {
      const provider = await ServiceProvider.findOne({ userId }).select("_id");
      isProvider =
        provider && booking.providerId.toString() === provider._id.toString();
    }

    if (!isOwner && !isProvider && userRole !== ROLES.AGENT) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    /**
     * UPDATE STATUS
     */
    booking.status = status;
    booking.timeline.push({
      status,
      message: message || `Status updated to ${status}`,
      updatedBy: userId,
    });

    if (status === "completed" && !booking.actualCompletionDate) {
      booking.actualCompletionDate = new Date();
    }

    await booking.save();

    /**
     * PROVIDER METRICS UPDATE
     */
    if (status === "completed" && isProvider) {
      await ServiceProvider.findByIdAndUpdate(booking.providerId, {
        $inc: { completedBookings: 1 },
      });
    }

    /**
     * RESPONSE
     */
    const updatedBooking = await ServiceBooking.findById(booking._id)
      .populate("complianceItemId", "name code")
      .populate("providerId", "companyName rating")
      .lean();

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

/**
 * Cancel a booking
 *
 * @route   PATCH /api/bookings/:id/cancel
 * @body    { reason? }
 * @access  Business Owner, Agent
 */
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = req.booking; // loaded by loadBooking middleware

    /**
     * OWNERSHIP CHECK
     * (Agent already validated by middleware)
     */
    const isOwner = booking.businessOwnerId.toString() === userId.toString();

    if (!isOwner && userRole !== ROLES.AGENT) {
      return res.status(403).json({
        success: false,
        message: "Only the business owner or authorized agent can cancel",
      });
    }

    /**
     * BUSINESS RULES
     */
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });
    }

    /**
     * CANCEL BOOKING
     */
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.timeline.push({
      status: "cancelled",
      message: reason || "Booking cancelled",
      updatedBy: userId,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

/**
 * Add rating to a completed booking
 *
 * @route   POST /api/bookings/:id/rating
 * @body    { score, comment? }
 * @access  Business Owner, Agent
 */
export const addRating = async (req, res) => {
  try {
    const { score, comment } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = req.booking; // loaded by loadBooking middleware

    /**
     * OWNERSHIP CHECK
     * (Agent already validated by middleware)
     */
    const isOwner = booking.businessOwnerId.toString() === userId.toString();

    if (!isOwner && userRole !== ROLES.AGENT) {
      return res.status(403).json({
        success: false,
        message: "Only the business owner or authorized agent can rate",
      });
    }

    /**
     * BUSINESS RULES
     */
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed bookings",
      });
    }

    if (booking.rating?.score) {
      return res.status(400).json({
        success: false,
        message: "Booking already rated",
      });
    }

    /**
     * SAVE RATING
     */
    booking.rating = {
      score: Number(score),
      comment,
      ratedAt: new Date(),
    };

    await booking.save();

    /**
     * RECALCULATE PROVIDER RATING
     */
    const allRatings = await ServiceBooking.find({
      providerId: booking.providerId,
      "rating.score": { $exists: true },
    }).select("rating.score");

    const avgRating =
      allRatings.reduce((sum, b) => sum + b.rating.score, 0) /
      allRatings.length;

    await ServiceProvider.findByIdAndUpdate(booking.providerId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    res.status(200).json({
      success: true,
      message: "Rating added successfully",
      data: booking.rating,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add rating",
      error: error.message,
    });
  }
};

/**
 * Get booking statistics for current user
 *
 * @route   GET /api/bookings/stats
 */
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { businessOwnerId: filterBusinessOwnerId } = req.query;

    const matchQuery = {};

    /**
     * AGENT FLOW
     */
    if (userRole === ROLES.AGENT) {
      const authorizedBusinessOwnerIds = await getAgentBusinessOwnerIds(userId);

      if (authorizedBusinessOwnerIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            total: 0,
            pending: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0,
          },
        });
      }

      if (filterBusinessOwnerId) {
        const isAllowed = authorizedBusinessOwnerIds.some(
          (id) => id.toString() === filterBusinessOwnerId
        );

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            message: "Not authorized for this business",
          });
        }

        matchQuery.businessOwnerId = filterBusinessOwnerId;
      } else {
        matchQuery.businessOwnerId = { $in: authorizedBusinessOwnerIds };
      }
    } else if (userRole === ROLES.BUSINESS_OWNER) {

    /**
     * BUSINESS OWNER FLOW
     */
      matchQuery.businessOwnerId = userId;
    } else if (userRole === ROLES.SERVICE_PROVIDER) {

    /**
     * SERVICE PROVIDER FLOW
     */
      const provider = await ServiceProvider.findOne({ userId }).select("_id");

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found",
        });
      }

      matchQuery.providerId = provider._id;
    }

    /**
     * AGGREGATION
     */
    const stats = await ServiceBooking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$agreedPrice" },
        },
      },
    ]);

    /**
     * NORMALIZE RESPONSE
     */
    const statsMap = {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    stats.forEach((stat) => {
      statsMap[stat._id] = stat.count;
      statsMap.total += stat.count;

      if (stat._id === "completed") {
        statsMap.totalRevenue = stat.totalValue;
      }
    });

    res.status(200).json({
      success: true,
      data: statsMap,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
