import ServiceBooking from "../models/ServiceBooking.js";
import ServiceProvider from "../models/ServiceProvider.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import ComplianceItem from "../models/ComplianceItem.js";
import ROLES from "../utils/constants/roles.js";

/**
 * ============================================================================
 * SERVICE PROVIDER BOOKING REQUESTS
 * ============================================================================
 */

/**
 * Get all booking requests for the logged-in service provider
 * GET /api/service-provider/bookings/requests
 */
export const getBookingRequests = async (req, res) => {
  try {
    const { search, dateFrom, dateTo, complianceItemId } = req.query;

    // Get service provider profile
    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    // Build query
    const query = {
      providerId: provider._id,
      status: "pending",
    };

    // Compliance item filter
    if (complianceItemId) {
      query.complianceItemId = complianceItemId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.bookedAt = {};
      if (dateFrom) query.bookedAt.$gte = new Date(dateFrom);
      if (dateTo) query.bookedAt.$lte = new Date(dateTo);
    }

    // Fetch bookings
    let bookings = await ServiceBooking.find(query)
      .populate("businessOwnerId", "name phone email")
      .populate("complianceItemId", "name code")
      .populate("createdBy", "name role")
      .sort({ bookedAt: -1 })
      .lean();

    // Search filter (in-memory)
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter((booking) => {
        const bookingId = booking.bookingId?.toLowerCase() || "";
        const businessName = booking.businessOwnerId?.name?.toLowerCase() || "";
        return (
          bookingId.includes(searchLower) || businessName.includes(searchLower)
        );
      });
    }

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get booking requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking requests",
      error: error.message,
    });
  }
};

/**
 * Accept a booking request
 * PATCH /api/service-provider/bookings/:id/accept
 */
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const booking = await ServiceBooking.findOne({
      _id: id,
      providerId: provider._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be accepted",
      });
    }

    // Update status
    booking.status = "accepted";
    booking.timeline.push({
      status: "accepted",
      message: "Service provider accepted the booking",
      updatedBy: req.user._id,
    });

    await booking.save();

    const updatedBooking = await ServiceBooking.findById(booking._id)
      .populate("businessOwnerId", "name phone")
      .populate("complianceItemId", "name code")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept booking",
      error: error.message,
    });
  }
};

/**
 * Reject a booking request
 * PATCH /api/service-provider/bookings/:id/reject
 */
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const booking = await ServiceBooking.findOne({
      _id: id,
      providerId: provider._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    // Update status
    booking.status = "rejected";
    booking.cancellationReason = reason;
    booking.timeline.push({
      status: "rejected",
      message: `Service provider rejected: ${reason}`,
      updatedBy: req.user._id,
    });

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking rejected",
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject booking",
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * MY BOOKINGS (IN PROGRESS)
 * ============================================================================
 */

/**
 * Get all active bookings for service provider
 * GET /api/service-provider/bookings
 */
export const getMyBookings = async (req, res) => {
  try {
    const {
      status,
      sortBy = "bookedAt",
      sortOrder = "desc",
      limit = 20,
      page = 1,
    } = req.query;

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const query = {
      providerId: provider._id,
    };

    // Status filter
    if (status) {
      query.status = status;
    } else {
      // Default: show in-progress bookings
      query.status = {
        $in: ["accepted", "in_progress", "documents_submitted"],
      };
    }

    // Pagination
    const parsedLimit = Number(limit);
    const parsedPage = Number(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const sortOptions = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [bookings, total] = await Promise.all([
      ServiceBooking.find(query)
        .populate("businessOwnerId", "name phone email")
        .populate("complianceItemId", "name code")
        .populate("createdBy", "name role")
        .sort(sortOptions)
        .limit(parsedLimit)
        .skip(skip)
        .lean(),
      ServiceBooking.countDocuments(query),
    ]);

    return res.status(200).json({
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
    console.error("Get my bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * BOOKING DETAILS
 * ============================================================================
 */

/**
 * Get booking details
 * GET /api/service-provider/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const booking = await ServiceBooking.findOne({
      _id: id,
      providerId: provider._id,
    })
      .populate("businessOwnerId", "name phone email")
      .populate("complianceItemId", "name code description validityDays")
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

    // Get deliverables uploaded by this provider
    const deliverables = await Document.find({
      uploadedByUser: req.user._id,
      uploadedForUser: booking.businessOwnerId._id,
      complianceItemId: booking.complianceItemId._id,
    })
      .populate("uploadedByUser", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        deliverables,
      },
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * SERVICE UPDATES (TIMELINE)
 * ============================================================================
 */

/**
 * Post a service update
 * POST /api/service-provider/bookings/:id/update
 */
export const postServiceUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update message is required",
      });
    }

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const booking = await ServiceBooking.findOne({
      _id: id,
      providerId: provider._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate status transition if status is provided
    if (status) {
      const validTransitions = {
        accepted: ["in_progress"],
        in_progress: ["documents_submitted"],
        documents_submitted: ["completed"],
      };

      const allowedNextStatuses = validTransitions[booking.status] || [];

      if (!allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from ${booking.status} to ${status}`,
        });
      }

      booking.status = status;

      if (status === "completed" && !booking.actualCompletionDate) {
        booking.actualCompletionDate = new Date();
      }
    }

    // Add timeline entry
    booking.timeline.push({
      status: status || booking.status,
      message: message.trim(),
      updatedBy: req.user._id,
    });

    await booking.save();

    const updatedBooking = await ServiceBooking.findById(booking._id)
      .populate("timeline.updatedBy", "name")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Update posted successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Post service update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to post update",
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * UPLOAD DELIVERABLES
 * ============================================================================
 */

/**
 * Upload deliverables for a booking
 * POST /api/service-provider/bookings/:id/deliverables
 */
export const uploadDeliverables = async (req, res) => {
  try {
    const { id } = req.params;
    const { validFrom } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const booking = await ServiceBooking.findOne({
      _id: id,
      providerId: provider._id,
    }).populate("complianceItemId", "validityDays");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Calculate validity dates
    let computedValidFrom = validFrom ? new Date(validFrom) : new Date();
    let computedValidUntil = null;

    if (booking.complianceItemId.validityDays) {
      computedValidUntil = new Date(
        computedValidFrom.getTime() +
          booking.complianceItemId.validityDays * 24 * 60 * 60 * 1000
      );
    }

    // Create Document entry
    const fileMeta = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype.split("/")[1],
      storageProvider: "local",
    };

    const document = await Document.create({
      uploadedByUser: req.user._id,
      uploadedForUser: booking.businessOwnerId,
      complianceItemId: booking.complianceItemId._id,
      validFrom: computedValidFrom,
      validUntil: computedValidUntil,
      file: fileMeta,
      status: "pending", // Admin will review
    });

    // Add to booking documents array
    booking.documents.push({
      name: req.file.originalname,
      url: fileMeta.filePath,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      verified: false,
    });

    // Update booking status
    if (booking.status !== "documents_submitted") {
      booking.status = "documents_submitted";
      booking.timeline.push({
        status: "documents_submitted",
        message: "Service provider uploaded deliverables",
        updatedBy: req.user._id,
      });
    }

    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Deliverable uploaded successfully",
      data: {
        document,
        booking: {
          _id: booking._id,
          status: booking.status,
        },
      },
    });
  } catch (error) {
    console.error("Upload deliverables error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload deliverable",
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * STATISTICS
 * ============================================================================
 */

/**
 * Get booking statistics for service provider
 * GET /api/service-provider/bookings/stats
 */
export const getBookingStats = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const stats = await ServiceBooking.aggregate([
      { $match: { providerId: provider._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$agreedPrice" },
        },
      },
    ]);

    const statsMap = {
      total: 0,
      pending: 0,
      accepted: 0,
      in_progress: 0,
      documents_submitted: 0,
      completed: 0,
      rejected: 0,
      totalRevenue: 0,
    };

    stats.forEach((stat) => {
      statsMap[stat._id] = stat.count;
      statsMap.total += stat.count;

      if (stat._id === "completed") {
        statsMap.totalRevenue = stat.totalValue;
      }
    });

    return res.status(200).json({
      success: true,
      data: statsMap,
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
