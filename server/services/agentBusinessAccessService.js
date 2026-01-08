import BusinessAgentRelation from "../models/BusinessAgentRelation.js";

/**
 * Check whether an agent has active access to a business
 *
 * @param {Object} params
 * @param {string|ObjectId} params.agentId
 * @param {string|ObjectId} params.businessOwnerId
 * @returns {Promise<boolean>}
 */
export const hasAgentBusinessAccess = async ({ agentId, businessOwnerId }) => {
  if (!agentId || !businessOwnerId) return false;

  const relation = await BusinessAgentRelation.findOne({
    agentId,
    businessOwnerId,
    status: "active",
  }).select("_id");

  return !!relation;
};

/**
 * Get all businessOwnerIds an agent manages
 */
export const getAgentBusinessOwnerIds = async (agentId) => {
  const relations = await BusinessAgentRelation.find({
    agentId,
    status: "active",
  }).select("businessOwnerId");

  return relations.map((r) => r.businessOwnerId);
};
