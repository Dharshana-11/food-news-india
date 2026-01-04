/**
 * agentInviteController.js
 * ============================================================================
 * Controller for agent to manage business invites
 */

import BusinessAgentRelation from "../models/BusinessAgentRelation.js";
import BusinessProfile from "../models/BusinessProfile.js";
import User from "../models/User.js";

/**
 * GET /api/agent-invites
 * ============================================================================
 * Fetch all pending invites for the logged-in agent
 */
export const getAgentInvites = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).select("_id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const invites = await BusinessAgentRelation.find({
      agentId: user._id,
      status: "pending",
    })
      .populate({
        path: "businessOwnerId",
        select: "name email phone city state",
      })
      .sort({ invitedAt: -1 })
      .lean();

    const validInvites = [];

    for (const invite of invites) {
      const relation = new BusinessAgentRelation(invite);
      if (!relation.isPendingActive()) continue;

      const businessProfile = await BusinessProfile.findOne({
        userId: invite.businessOwnerId._id,
      })
        .select("businessName registeredAddress businessTypeId")
        .lean();

      validInvites.push({
        ...invite,
        businessDetails: {
          businessName: businessProfile?.businessName || "N/A",
          registeredAddress: businessProfile?.registeredAddress || "N/A",
          businessTypeId: businessProfile?.businessTypeId || null,
        },
      });
    }

    res.json({
      success: true,
      invites: validInvites,
      count: validInvites.length,
    });
  } catch (error) {
    console.error("Get agent invites error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invites" });
  }
};

/**
 * PATCH /api/agent-invites/:relationId/accept
 */
export const acceptInvite = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).select("_id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const relation = await BusinessAgentRelation.findById(
      req.params.relationId
    );
    if (!relation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    if (!relation.agentId.equals(user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (relation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept invitation with status: ${relation.status}`,
      });
    }

    if (!relation.isPendingActive()) {
      return res.status(400).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    relation.status = "active";
    relation.acceptedAt = new Date();

    relation.activityLog.push({
      action: "status_changed",
      description: "Agent accepted the invitation",
      timestamp: new Date(),
      metadata: { oldStatus: "pending", newStatus: "active" },
    });

    await relation.save();

    await relation.populate({
      path: "businessOwnerId",
      select: "name email phone city state",
    });

    res.json({
      success: true,
      message: "Invitation accepted successfully",
      relation,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept invitation" });
  }
};

/**
 * PATCH /api/agent-invites/:relationId/reject
 */
export const rejectInvite = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).select("_id");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const relation = await BusinessAgentRelation.findById(
      req.params.relationId
    );
    if (!relation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    if (!relation.agentId.equals(user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (relation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject invitation with status: ${relation.status}`,
      });
    }

    relation.status = "rejected";
    relation.rejectedAt = new Date();
    relation.reasonForRejection = req.body.reason || "";

    relation.activityLog.push({
      action: "status_changed",
      description: "Agent rejected the invitation",
      timestamp: new Date(),
      metadata: {
        oldStatus: "pending",
        newStatus: "rejected",
        reason: req.body.reason || "",
      },
    });

    await relation.save();

    res.json({
      success: true,
      message: "Invitation rejected successfully",
      relation,
    });
  } catch (error) {
    console.error("Reject invite error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject invitation" });
  }
};
