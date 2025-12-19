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
 *
 * @route   GET /api/agents/available
 * @access  Private (Business Owner)
 *
 * @query   {string}  [search]         Name or phone search
 * @query   {string}  [city]           City filter
 * @query   {number}  [minRating]      Minimum rating
 * @query   {number}  [maxCommission]  Maximum commission rate
 */
export const getAvailableAgents = async (req, res) => {
  try {
    const { search, city, minRating, maxCommission } = req.query;

    /** ---------------- User Filters ---------------- */
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

    /** ---------------- Profile Filters ---------------- */
    const profileFilter = { isAvailable: true };

    if (city) profileFilter.city = { $regex: city, $options: "i" };
    if (minRating) profileFilter.rating = { $gte: Number(minRating) };
    if (maxCommission)
      profileFilter.commissionRate = { $lte: Number(maxCommission) };

    /** ---------------- Fetch Agents ---------------- */
    const agents = await Users.find(userFilter)
      .select("uid name phone email createdAt")
      .lean();

    const businessOwnerId = req.user._id;

    /** ---------------- Existing Relations ---------------- */
    const relations = await BusinessAgentRelation.find({
      businessOwnerId,
      status: { $in: ["pending", "active"] },
    }).lean();

    const relationMap = {};
    relations.forEach((rel) => {
      relationMap[rel.agentId.toString()] = {
        status: rel.status,
        relationId: rel._id,
      };
    });

    /** ---------------- Agent Profiles ---------------- */
    const agentIds = agents.map((agent) => agent._id);

    const profiles = await AgentProfile.find({
      userId: { $in: agentIds },
      ...profileFilter,
    }).lean();

    /** ---------------- Merge Data ---------------- */
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.userId.toString()] = profile;
      return acc;
    }, {});

    const result = agents
      .map((agent) => {
        const profile = profileMap[agent._id.toString()];

        if (!profile) return null;

        const relation = relationMap[agent._id.toString()] || null;

        return {
          _id: agent._id,
          uid: agent.uid,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,

          rating: profile.rating || 0,
          totalReviews: profile.totalReviews || 0,
          businessesManaged: profile.businessesManaged || 0,
          commissionRate: profile.commissionRate || 7500,
          experience: profile.experience || 0,
          specialization: profile.specialization || [],
          city: profile.city || "",
          state: profile.state || "",
          bio: profile.bio || "",

          inviteStatus: relation?.status || null,
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
 *
 * @route   GET /api/agents/my-agents
 * @access  Private (Business Owner)
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

    const agentIds = relations.map((rel) => rel.agentId._id);

    const profiles = await AgentProfile.find({
      userId: { $in: agentIds },
    }).lean();

    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.userId.toString()] = profile;
      return acc;
    }, {});

    const result = relations.map((rel) => {
      const agent = rel.agentId;
      const profile = profileMap[agent._id.toString()];

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
 *
 * @route   GET /api/agents/:relationId
 * @access  Private (Business Owner)
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

    if (relation.status === "pending") {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Agent is pending",
      });
    }

    const profile = await AgentProfile.findOne({
      userId: relation.agentId._id,
    }).lean();

    return res.json({
      success: true,
      data: {
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

        rating: profile?.rating || 0,
        totalReviews: profile?.totalReviews || 0,
        businessesManaged: profile?.businessesManaged || 0,
        experience: profile?.experience || 0,
        specialization: profile?.specialization || [],
        bio: profile?.bio || "",
        city: profile?.city || "",
        state: profile?.state || "",
      },
    });
  } catch (error) {
    console.error("Get agent details error:", error);
    return res.status(500).json({ message: "Failed to fetch agent details" });
  }
};
/**
 * Invite an agent to manage the business
 * -----------------------------------------------------------------------------
 * - Only one active agent allowed per business owner
 * - Prevents duplicate active/pending invitations
 * - Uses agent's commission rate at time of invite
 *
 * @route   POST /api/agents/invite
 * @access  Private (Business Owner)
 */
export const inviteAgent = async (req, res) => {
  try {
    const businessOwnerId = req.user._id;
    const { agentId, permissions } = req.body;

    /* ---------------- Validate agent ---------------- */
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

    /* ---------------- Enforce single active agent ---------------- */
    const hasActiveAgent = await BusinessAgentRelation.exists({
      businessOwnerId,
      status: "active",
    });

    if (hasActiveAgent) {
      return res.status(400).json({
        message:
          "You already have an active agent. Remove the current agent before inviting another.",
      });
    }

    /* ---------------- Check existing relation ---------------- */
    const existingRelation = await BusinessAgentRelation.findOne({
      businessOwnerId,
      agentId,
      status: { $in: ["pending", "active"] },
    });

    if (existingRelation) {
      if (existingRelation.status === "active") {
        return res.status(400).json({
          message: "You already have an active relation with this agent",
        });
      }

      if (
        existingRelation.status === "pending" &&
        existingRelation.isPendingActive()
      ) {
        return res.status(400).json({
          message:
            "You already have a pending invitation to this agent. Cancel or wait for it to expire.",
        });
      }
      // expired pending → allowed to re-invite
    }

    /* ---------------- Validate agent profile ---------------- */
    const agentProfile = await AgentProfile.findOne({
      userId: agentId,
      isAvailable: true,
    });

    if (!agentProfile || agentProfile.commissionRate <= 0) {
      return res.status(400).json({
        message: "Agent commission is not set or invalid",
      });
    }

    /* ---------------- Create invitation ---------------- */
    const defaultPermissions = {
      canUploadDocuments: true,
      canSubmitApplications: true,
      canViewDashboard: true,
      canReceiveUpdates: true,
    };

    const relation = await BusinessAgentRelation.create({
      businessOwnerId,
      agentId,
      status: "pending",
      agreedCommission: agentProfile.commissionRate,
      permissions: permissions || defaultPermissions,
      invitedAt: new Date(),
      pendingExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
 * Update permissions for an active agent
 *
 * @route   PATCH /api/agents/:relationId/permissions
 * @access  Private (Business Owner)
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
 * Remove an agent (pending or active)
 *
 * @route   DELETE /api/agents/:relationId
 * @access  Private (Business Owner)
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

    /* ---------------- Update agent metrics ---------------- */
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
