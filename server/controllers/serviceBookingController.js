import ServiceBooking from "../models/ServiceBooking.js";
import ComplianceItem from "../models/ComplianceItem.js";
import ServiceProvider from "../models/ServiceProvider.js";
import User from "../models/User.js";
import ROLES from "../utils/constants/roles.js";

/**
 * Create a new booking
 * POST /api/bookings
 * Body: { complianceItemId, providerId, agreedPrice, estimatedDays, notes }
 */
// export const createBooking = async (req, res) => {
//   try {
//     const { complianceItemId, providerId, agreedPrice, estimatedDays, notes } =
//       req.body;
//     const user = await User.findOne({ uid: req.user.uid });
// if (!user) {
//   return res
//     .status(401)
//     .json({ success: false, message: "User not found" });
// }

// const businessOwnerId = user._id;

//     // Validate compliance item and provider
//     const [complianceItem, provider] = await Promise.all([
//       ComplianceItem.findById(complianceItemId),
//       ServiceProvider.findById(providerId),
//     ]);

//     if (!complianceItem || complianceItem.status !== "active") {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found or inactive",
//       });
//     }

//     if (!provider || provider.status !== "active") {
//       return res.status(404).json({
//         success: false,
//         message: "Service provider not found or inactive",
//       });
//     }

//     // Verify provider offers this compliance item
//     const providerOffersItem = provider.complianceItemsOffered.some(
//       (itemId) => itemId.toString() === complianceItemId
//     );

//     if (!providerOffersItem) {
//       return res.status(400).json({
//         success: false,
//         message: "This provider does not offer the selected service",
//       });
//     }

//      const pricing = provider.pricingPerItem.find(
//   (p) => p.complianceItemId.toString() === complianceItemId
// );

//    const finalPrice = agreedPrice ?? pricing?.price;
// const finalDays = estimatedDays ?? pricing?.estimatedDays ?? 7;

//     // Calculate expected completion date
//     const expectedCompletionDate = new Date();
//     expectedCompletionDate.setDate(
//       expectedCompletionDate.getDate() + finalDays
//     );

//     // Create booking
//     const booking = await ServiceBooking.create({
//       businessOwnerId,
//       complianceItemId,
//       providerId,
//       agreedPrice: finalPrice,
//       estimatedDays: finalDays,
//       expectedCompletionDate,
//       notes,
//       timeline: [
//         {
//           status: "pending",
//           message: "Booking request submitted",
//           timestamp: new Date(),
//           updatedBy: businessOwnerId,
//         },
//       ],
//     });

//

//     res.status(201).json({
//       success: true,
//       message: "Booking created successfully",
//       data: booking,
//     });
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create booking",
//       error: error.message,
//     });
//   }
// };

export const createBooking = async (req, res) => {
  try {
    const { complianceItemId, providerId, agreedPrice, estimatedDays, notes } =
      req.body;

    // Resolve Mongo user from Firebase session
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const businessOwnerId = user._id;

    const [complianceItem, provider] = await Promise.all([
      ComplianceItem.findById(complianceItemId),
      ServiceProvider.findById(providerId),
    ]);

    if (!complianceItem || complianceItem.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    if (!provider || provider.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });
    }

    const pricing = provider.pricingPerItem.find(
      (p) => p.complianceItemId.toString() === complianceItemId
    );

    const finalPrice = agreedPrice ?? pricing?.price;
    const finalDays = estimatedDays ?? pricing?.estimatedDays ?? 7;

    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(
      expectedCompletionDate.getDate() + finalDays
    );

    const booking = await ServiceBooking.create({
      businessOwnerId,
      complianceItemId,
      providerId,
      agreedPrice: finalPrice,
      estimatedDays: finalDays,
      expectedCompletionDate,
      notes,
      timeline: [
        {
          status: "pending",
          message: "Booking request submitted",
          updatedBy: businessOwnerId,
        },
      ],
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create booking" });
  }
};

/**
 * Get all bookings for current user
 * GET /api/bookings
 * Query params: status, sortBy, sortOrder, limit, page
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

    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    // Filter based on role
    if (userRole === ROLES.BUSINESS_OWNER) {
      query.businessOwnerId = userId;
    } else if (userRole === ROLES.SERVICE_PROVIDER) {
      const provider = await ServiceProvider.findOne({ userId });
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Service provider profile not found",
        });
      }
      query.providerId = provider._id;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      ServiceBooking.find(query)
        .populate("complianceItemId", "name code description validityDays")
        .populate("providerId", "companyName rating logo")
        .populate("businessOwnerId", "name phone")
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      ServiceBooking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
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
 * GET /api/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await ServiceBooking.findById(id)
      .populate("complianceItemId")
      .populate({
        path: "providerId",
        select: "companyName rating logo userId",
      })
      .populate("businessOwnerId", "name phone email")
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

    const isOwner = booking.businessOwnerId._id.toString() === userId;

    const isProvider = booking.providerId?.userId?.toString() === userId;

    const isAdmin = ["admin", "super_admin"].includes(userRole);

    if (!isOwner && !isProvider && !isAdmin) {
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
 * PATCH /api/bookings/:id/status
 * Body: { status, message }
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const userId = req.user._id;

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Authorization check
    const isOwner = booking.businessOwnerId.toString() === userId;
    const provider = await ServiceProvider.findOne({ userId });
    const isProvider =
      provider && booking.providerId.toString() === provider._id.toString();

    if (!isOwner && !isProvider) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    // Update status
    booking.status = status;
    booking.timeline.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date(),
      updatedBy: userId,
    });

    // Set completion date if completed
    if (status === "completed" && !booking.actualCompletionDate) {
      booking.actualCompletionDate = new Date();
    }

    await booking.save();

    // Update provider stats if completed
    if (status === "completed" && isProvider) {
      await ServiceProvider.findByIdAndUpdate(booking.providerId, {
        $inc: { completedBookings: 1 },
      });
    }

    const updatedBooking = await ServiceBooking.findById(id)
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
 * Cancel booking (business owner only)
 * PATCH /api/bookings/:id/cancel
 * Body: { reason }
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const userId = req.user._id.toString();

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only business owner can cancel
    if (booking.businessOwnerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the booking owner can cancel",
      });
    }

    // Can't cancel if already completed
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.timeline.push({
      status: "cancelled",
      message: reason || "Booking cancelled by customer",
      updatedBy: booking.businessOwnerId,
      timestamp: new Date(),
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
 * Add rating to completed booking
 * POST /api/bookings/:id/rating
 * Body: { score, comment }
 */
export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;

    // 🔹 Resolve Mongo user from Firebase session
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 🔹 Ownership check (FIXED)
    if (booking.businessOwnerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the booking owner can rate",
      });
    }

    // 🔹 Status check
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed bookings",
      });
    }

    // 🔹 Already rated check
    if (booking.rating?.score) {
      return res.status(400).json({
        success: false,
        message: "Booking already rated",
      });
    }

    booking.rating = {
      score: parseInt(score),
      comment,
      ratedAt: new Date(),
    };

    await booking.save();

    // 🔹 Recalculate provider rating
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
 * Get booking statistics
 * GET /api/bookings/stats
 */
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchQuery = {};

    if (userRole === ROLES.BUSINESS_OWNER) {
      matchQuery.businessOwnerId = userId;
    } else if (userRole === ROLES.SERVICE_PROVIDER) {
      const provider = await ServiceProvider.findOne({ userId });
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider profile not found",
        });
      }
      matchQuery.providerId = provider._id;
    }

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
