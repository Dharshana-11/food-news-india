/**
 * agentController.js
 * ============================================================================
 * Business Owner operations for managing their agents
 */

import Users from "../models/User.js";
import AgentProfile from "../models/AgentProfile.js";
import BusinessAgentRelation from "../models/BusinessAgentRelation.js";
import ROLES from "../utils/constants/roles.js";

/**
 * Get list of available agents for selection
 * @route GET /api/agents/available
 * @access Private (Business Owner)
 */
export const getAvailableAgents = async (req, res) => {
  try {
    const { search, city, minRating, maxCommission } = req.query;

    // Build filter
    const userFilter = {
      role: ROLES.AGENT,
      status: "verified",
      isVerified: true,
      isDeleted: false,
    };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const profileFilter = { isAvailable: true };
    if (city) profileFilter.city = { $regex: city, $options: "i" };
    if (minRating) profileFilter.rating = { $gte: parseFloat(minRating) };
    if (maxCommission)
      profileFilter.commissionRate = { $lte: parseFloat(maxCommission) };

    // Get agents
    const agents = await Users.find(userFilter)
      .select("uid name phone email createdAt")
      .lean();

    const businessOwnerId = req.user._id;

    const relations = await BusinessAgentRelation.find({
      businessOwnerId,
      status: { $in: ["pending", "active"] },
    }).lean();

    const relationMap = {};
    relations.forEach((r) => {
      relationMap[r.agentId.toString()] = {
        status: r.status,
        relationId: r._id,
      };
    });

    const agentIds = agents.map((a) => a._id);

    const profiles = await AgentProfile.find({
      userId: { $in: agentIds },
      ...profileFilter,
    }).lean();

    // Merge data
    const result = agents
      .map((agent) => {
        const profile = profiles.find(
          (p) => p.userId.toString() === agent._id.toString()
        );
        if (!profile) return null;

        const relation = relationMap[agent._id.toString()] || null;

        return {
          _id: agent._id,
          uid: agent.uid,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,

          // Profile
          rating: profile.rating || 0,
          totalReviews: profile.totalReviews || 0,
          businessesManaged: profile.businessesManaged || 0,
          commissionRate: profile.commissionRate || 7500,
          experience: profile.experience || 0,
          specialization: profile.specialization || [],
          city: profile.city || "",
          state: profile.state || "",
          bio: profile.bio || "",

          inviteStatus: relation?.status || null, // pending | active | null
          relationId: relation?.relationId || null,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      count: result.length,
      agents: result,
    });
  } catch (error) {
    console.error("Get available agents error:", error);
    return res.status(500).json({ message: "Failed to fetch agents" });
  }
};

/**
 * Get business owner's agents (active + pending)
 * @route GET /api/agents/my-agents
 * @access Private (Business Owner)
 */
export const getMyAgents = async (req, res) => {
  try {
    const businessOwnerId = req.user._id;

    const relations = await BusinessAgentRelation.find({
      businessOwnerId,
      status: { $in: ["pending", "active"] },
    })
      .populate("agentId", "uid name phone email")
      .lean();

    const agentIds = relations.map((r) => r.agentId._id);

    const profiles = await AgentProfile.find({
      userId: { $in: agentIds },
    }).lean();

    const result = relations.map((rel) => {
      const agent = rel.agentId;
      const profile = profiles.find(
        (p) => p.userId.toString() === agent._id.toString()
      );

      return {
        relationId: rel._id,
        agentId: agent._id,
        uid: agent.uid,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        status: rel.status,
        permissions: rel.permissions,
        agreedCommission: rel.agreedCommission,
        invitedAt: rel.invitedAt,
        acceptedAt: rel.acceptedAt,
        activityLog: rel.activityLog || [],
        // Profile data
        rating: profile?.rating || 0,
        businessesManaged: profile?.businessesManaged || 0,
        experience: profile?.experience || 0,
        city: profile?.city || "",
      };
    });

    return res.json({
      success: true,
      count: result.length,
      agents: result,
    });
  } catch (error) {
    console.error("Get my agents error:", error);
    return res.status(500).json({ message: "Failed to fetch your agents" });
  }
};

/**
 * Get single agent details with activity
 * @route GET /api/agents/:relationId
 * @access Private (Business Owner)
 */
export const getAgentDetails = async (req, res) => {
  try {
    const { relationId } = req.params;
    const businessOwnerId = req.user._id;

    const relation = await BusinessAgentRelation.findOne({
      _id: relationId,
      businessOwnerId,
    })
      .populate("agentId", "uid name phone email")
      .lean();

    if (!relation) {
      return res.status(404).json({ message: "Agent relation not found" });
    }

    const profile = await AgentProfile.findOne({
      userId: relation.agentId._id,
    }).lean();

    const result = {
      relationId: relation._id,
      agent: {
        _id: relation.agentId._id,
        uid: relation.agentId.uid,
        name: relation.agentId.name,
        phone: relation.agentId.phone,
        email: relation.agentId.email,
      },
      status: relation.status,
      permissions: relation.permissions,
      agreedCommission: relation.agreedCommission,
      paymentFrequency: relation.paymentFrequency,
      invitedAt: relation.invitedAt,
      acceptedAt: relation.acceptedAt,
      activityLog: relation.activityLog || [],
      businessOwnerNotes: relation.businessOwnerNotes,
      // Profile
      rating: profile?.rating || 0,
      totalReviews: profile?.totalReviews || 0,
      businessesManaged: profile?.businessesManaged || 0,
      experience: profile?.experience || 0,
      specialization: profile?.specialization || [],
      bio: profile?.bio || "",
      city: profile?.city || "",
      state: profile?.state || "",
    };

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get agent details error:", error);
    return res.status(500).json({ message: "Failed to fetch agent details" });
  }
};

/**
 * Send invitation to an agent
 * @route POST /api/agents/invite
 * @access Private (Business Owner)
 */
export const inviteAgent = async (req, res) => {
  try {
    const businessOwnerId = req.user._id;
    const { agentId, agreedCommission, permissions } = req.body;

    // Validate agent exists
    const agent = await Users.findOne({
      _id: agentId,
      role: ROLES.AGENT,
      status: "verified",
      isDeleted: false,
    });

    if (!agent) {
      return res
        .status(404)
        .json({ message: "Agent not found or not available" });
    }

    const activeAgentExists = await BusinessAgentRelation.exists({
      businessOwnerId,
      status: "active",
    });

    if (activeAgentExists) {
      return res.status(400).json({
        message:
          "You already have an active agent. Remove the current agent before inviting another.",
      });
    }
    // Check for existing relation
    // Check for existing active or pending relation with this agent
    const existingRelation = await BusinessAgentRelation.findOne({
      businessOwnerId,
      agentId,
      status: { $in: ["pending", "active"] },
    });

    // If active, block invite
    if (existingRelation && existingRelation.status === "active") {
      return res.status(400).json({
        message: "You already have an active relation with this agent",
      });
    }

    // If pending, check if invite is still active
    if (existingRelation && existingRelation.status === "pending") {
      if (existingRelation.isPendingActive()) {
        return res.status(400).json({
          message:
            "You already have a pending invitation to this agent. Cancel or wait for it to expire.",
        });
      }
      // Otherwise, pending invite expired → allow creating a new one
    }

    // Create invitation
    const relation = await BusinessAgentRelation.create({
      businessOwnerId,
      agentId,
      status: "pending",
      agreedCommission: agreedCommission || 7500,
      permissions: permissions || {
        canUploadDocuments: true,
        canSubmitApplications: true,
        canViewDashboard: true,
        canReceiveUpdates: true,
      },
      invitedAt: new Date(),
      pendingExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // optional 7-day expiry
    });

    return res.status(201).json({
      success: true,
      message: "Agent invitation sent successfully",
      relationId: relation._id,
    });
  } catch (error) {
    console.error("Invite agent error:", error);
    return res.status(500).json({ message: "Failed to send invitation" });
  }
};

/**
 * Update agent permissions
 * @route PATCH /api/agents/:relationId/permissions
 * @access Private (Business Owner)
 */
export const updateAgentPermissions = async (req, res) => {
  try {
    const { relationId } = req.params;
    const businessOwnerId = req.user._id;
    const { permissions } = req.body;

    const relation = await BusinessAgentRelation.findOneAndUpdate(
      {
        _id: relationId,
        businessOwnerId,
        status: "active",
      },
      {
        permissions,
        $push: {
          activityLog: {
            action: "profile_updated",
            description: "Permissions updated by business owner",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!relation) {
      return res
        .status(404)
        .json({ message: "Agent relation not found or not active" });
    }

    return res.json({
      success: true,
      message: "Permissions updated successfully",
      permissions: relation.permissions,
    });
  } catch (error) {
    console.error("Update permissions error:", error);
    return res.status(500).json({ message: "Failed to update permissions" });
  }
};

/**
 * Remove agent
 * @route DELETE /api/agents/:relationId
 * @access Private (Business Owner)
 */
export const removeAgent = async (req, res) => {
  try {
    const { relationId } = req.params;
    const businessOwnerId = req.user._id;
    const { reason } = req.body;

    const relation = await BusinessAgentRelation.findOneAndUpdate(
      {
        _id: relationId,
        businessOwnerId,
        status: { $in: ["pending", "active"] },
      },
      {
        status: "removed",
        removedAt: new Date(),
        reasonForRemoval: reason || "",
        $push: {
          activityLog: {
            action: "status_changed",
            description: "Agent removed by business owner",
            timestamp: new Date(),
            metadata: { reason },
          },
        },
      },
      { new: true }
    );

    if (!relation) {
      return res.status(404).json({ message: "Agent relation not found" });
    }

    // Update agent's businessesManaged count
    const agentProfile = await AgentProfile.findOne({
      userId: relation.agentId,
    });
    if (agentProfile && agentProfile.businessesManaged > 0) {
      agentProfile.businessesManaged -= 1;
      await agentProfile.save();
    }

    return res.json({
      success: true,
      message: "Agent removed successfully",
    });
  } catch (error) {
    console.error("Remove agent error:", error);
    return res.status(500).json({ message: "Failed to remove agent" });
  }
};
