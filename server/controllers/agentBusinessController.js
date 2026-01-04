/**
 * agentBusinessController.js
 * ============================================================================
 * Controller for agent to manage their assigned businesses
 * Handles viewing active businesses and accessing business workspaces
 */

import BusinessAgentRelation from "../models/BusinessAgentRelation.js";
import Users from "../models/User.js";
import BusinessProfile from "../models/BusinessProfile.js";
import Document from "../models/Document.js";
import Booking from "../models/Booking.js";

/**
 * GET /api/agent/businesses
 * ============================================================================
 * Fetch all active businesses assigned to the logged-in agent
 */
export const getMyBusinesses = async (req, res) => {
  try {
    // Get agent's MongoDB _id from uid
    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Find all active relations for this agent
    const relations = await BusinessAgentRelation.find({
      agentId: agent._id,
      status: "active",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .sort({ acceptedAt: -1 })
      .lean();

    // Enrich with business profile and stats
    const businesses = await Promise.all(
      relations.map(async (relation) => {
        const businessOwner = relation.businessOwnerId;

        // Fetch business profile
        const businessProfile = await BusinessProfile.findOne({
          userId: businessOwner._id,
        })
          .select("businessName registeredAddress businessTypeId")
          .populate("businessTypeId", "name")
          .lean();

        // Get document stats for this business
        const [totalDocs, pendingDocs, approvedDocs, expiredDocs] =
          await Promise.all([
            Document.countDocuments({
              uploadedBy: businessOwner._id,
              isDeleted: false,
            }),
            Document.countDocuments({
              uploadedBy: businessOwner._id,
              verificationStatus: "pending",
              isDeleted: false,
            }),
            Document.countDocuments({
              uploadedBy: businessOwner._id,
              verificationStatus: "approved",
              isDeleted: false,
            }),
            Document.countDocuments({
              uploadedBy: businessOwner._id,
              expiryDate: { $lt: new Date() },
              isDeleted: false,
            }),
          ]);

        // Get active bookings count
        const activeBookings = await Booking.countDocuments({
          businessOwnerId: businessOwner._id,
          status: {
            $in: ["pending", "accepted", "in_progress", "documents_submitted"],
          },
        });

        // Calculate compliance score (simplified)
        const complianceScore =
          totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

        return {
          relationId: relation._id,
          businessOwnerId: businessOwner._id,
          businessName: businessProfile?.businessName || "N/A",
          ownerName: businessOwner.name || "N/A",
          email: businessOwner.email,
          phone: businessOwner.phone,
          city: businessOwner.city,
          state: businessOwner.state,
          registeredAddress: businessProfile?.registeredAddress || "N/A",
          businessType: businessProfile?.businessTypeId?.name || "N/A",

          // Stats
          documentStats: {
            total: totalDocs,
            pending: pendingDocs,
            approved: approvedDocs,
            expired: expiredDocs,
          },
          activeBookings,
          complianceScore,

          // Relation details
          agreedCommission: relation.agreedCommission,
          permissions: relation.permissions,
          acceptedAt: relation.acceptedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      businesses,
      count: businesses.length,
    });
  } catch (error) {
    console.error("Get my businesses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch businesses",
      error: error.message,
    });
  }
};

/**
 * GET /api/agent/businesses/:relationId/workspace
 * ============================================================================
 * Get workspace data for a specific business (lite dashboard)
 */
export const getBusinessWorkspace = async (req, res) => {
  try {
    const { relationId } = req.params;

    // Get agent's MongoDB _id
    const agent = await Users.findOne({ uid: req.user.uid }).select("_id");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Verify relation ownership and active status
    const relation = await BusinessAgentRelation.findOne({
      _id: relationId,
      agentId: agent._id,
      status: "active",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .lean();

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Business relation not found or not active",
      });
    }

    const businessOwner = relation.businessOwnerId;

    // Fetch business profile
    const businessProfile = await BusinessProfile.findOne({
      userId: businessOwner._id,
    })
      .select("businessName registeredAddress businessTypeId")
      .populate("businessTypeId", "name")
      .lean();

    // Get document overview
    const [totalDocs, pendingDocs, approvedDocs, expiredDocs] =
      await Promise.all([
        Document.countDocuments({
          uploadedBy: businessOwner._id,
          isDeleted: false,
        }),
        Document.countDocuments({
          uploadedBy: businessOwner._id,
          verificationStatus: "pending",
          isDeleted: false,
        }),
        Document.countDocuments({
          uploadedBy: businessOwner._id,
          verificationStatus: "approved",
          isDeleted: false,
        }),
        Document.countDocuments({
          uploadedBy: businessOwner._id,
          expiryDate: { $lt: new Date() },
          isDeleted: false,
        }),
      ]);

    // Get recent bookings (limit to 3)
    const recentBookings = await Booking.find({
      businessOwnerId: businessOwner._id,
    })
      .populate("complianceItemId", "name category")
      .populate("providerId", "companyName")
      .sort({ bookedAt: -1, createdAt: -1 })
      .limit(3)
      .lean();

    // Get booking stats
    const [totalBookings, activeBookings, completedBookings] =
      await Promise.all([
        Booking.countDocuments({ businessOwnerId: businessOwner._id }),
        Booking.countDocuments({
          businessOwnerId: businessOwner._id,
          status: {
            $in: ["pending", "accepted", "in_progress", "documents_submitted"],
          },
        }),
        Booking.countDocuments({
          businessOwnerId: businessOwner._id,
          status: "completed",
        }),
      ]);

    // Calculate compliance score
    const complianceScore =
      totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        business: {
          name: businessProfile?.businessName || "N/A",
          ownerName: businessOwner.name,
          email: businessOwner.email,
          phone: businessOwner.phone,
          city: businessOwner.city,
          state: businessOwner.state,
          address: businessProfile?.registeredAddress || "N/A",
          type: businessProfile?.businessTypeId?.name || "N/A",
        },

        permissions: relation.permissions,

        documentStats: {
          total: totalDocs,
          pending: pendingDocs,
          approved: approvedDocs,
          expired: expiredDocs,
          complianceScore,
        },

        bookingStats: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
        },

        recentBookings,

        relationInfo: {
          relationId: relation._id,
          agreedCommission: relation.agreedCommission,
          acceptedAt: relation.acceptedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get business workspace error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business workspace",
      error: error.message,
    });
  }
};
