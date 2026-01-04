/**
 * agentInviteController.js
 * ============================================================================
 * Controller for agent to manage business invites
 * Handles viewing, accepting, and rejecting invitations
 */

import BusinessAgentRelation from "../models/BusinessAgentRelation.js";
import Users from "../models/Users.js";
import BusinessProfile from "../models/BusinessProfile.js";

/**
 * GET /api/agent-invites
 * ============================================================================
 * Fetch all pending invites for the logged-in agent
 */
export const getAgentInvites = async (req, res) => {
  try {
    const agentUserId = req.user.uid;

    // Find all pending relations for this agent
    const invites = await BusinessAgentRelation.find({
      agentId: agentUserId,
      status: "pending",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .sort({ invitedAt: -1 })
      .lean();

    // Filter out expired invites and enrich with business details
    const validInvites = [];

    for (const invite of invites) {
      // Check if invite is still valid
      const relation = new BusinessAgentRelation(invite);
      if (!relation.isPendingActive()) {
        // Skip expired invites
        continue;
      }

      // Fetch business profile details
      let businessProfile = null;
      try {
        businessProfile = await BusinessProfile.findOne({
          userId: invite.businessOwnerId._id,
        })
          .select("businessName registeredAddress businessTypeId")
          .lean();
      } catch (error) {
        console.error("Error fetching business profile:", error);
      }

      validInvites.push({
        ...invite,
        businessDetails: {
          businessName: businessProfile?.businessName || "N/A",
          registeredAddress: businessProfile?.registeredAddress || "N/A",
          businessTypeId: businessProfile?.businessTypeId || null,
        },
      });
    }

    res.status(200).json({
      success: true,
      invites: validInvites,
      count: validInvites.length,
    });
  } catch (error) {
    console.error("Get agent invites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invites",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/agent-invites/:relationId/accept
 * ============================================================================
 * Accept a pending invitation
 */
export const acceptInvite = async (req, res) => {
  try {
    const { relationId } = req.params;
    const agentUserId = req.user.uid;

    // Find the relation
    const relation = await BusinessAgentRelation.findById(relationId);

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify ownership
    if (relation.agentId.toString() !== agentUserId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This invitation is not for you",
      });
    }

    // Verify status
    if (relation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept invitation with status: ${relation.status}`,
      });
    }

    // Check if expired
    if (!relation.isPendingActive()) {
      return res.status(400).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    // Update relation
    relation.status = "active";
    relation.acceptedAt = new Date();

    // Add activity log
    relation.activityLog.push({
      action: "status_changed",
      description: "Agent accepted the invitation",
      timestamp: new Date(),
      metadata: {
        newStatus: "active",
        oldStatus: "pending",
      },
    });

    await relation.save();

    // Populate business owner details
    await relation.populate({
      path: "businessOwnerId",
      select: "name email phone city state",
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      relation,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/agent-invites/:relationId/reject
 * ============================================================================
 * Reject a pending invitation
 */
export const rejectInvite = async (req, res) => {
  try {
    const { relationId } = req.params;
    const agentUserId = req.user.uid;
    const { reason = "" } = req.body;

    // Find the relation
    const relation = await BusinessAgentRelation.findById(relationId);

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify ownership
    if (relation.agentId.toString() !== agentUserId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This invitation is not for you",
      });
    }

    // Verify status
    if (relation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject invitation with status: ${relation.status}`,
      });
    }

    // Update relation
    relation.status = "rejected";
    relation.rejectedAt = new Date();
    relation.reasonForRejection = reason;

    // Add activity log
    relation.activityLog.push({
      action: "status_changed",
      description: `Agent rejected the invitation${reason ? `: ${reason}` : ""}`,
      timestamp: new Date(),
      metadata: {
        newStatus: "rejected",
        oldStatus: "pending",
        reason,
      },
    });

    await relation.save();

    res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      relation,
    });
  } catch (error) {
    console.error("Reject invite error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject invitation",
      error: error.message,
    });
  }
};
