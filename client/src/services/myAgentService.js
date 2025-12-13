/**
 * myAgentService.js
 * ============================================================================
 * API service for agent management operations
 */

import api from "../api/axios";

const agentService = {
  /**
   * Get list of available agents
   * @param {Object} filters - { search, city, minRating, maxCommission }
   */
  getAvailableAgents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.city) params.append("city", filters.city);
    if (filters.minRating) params.append("minRating", filters.minRating);
    if (filters.maxCommission)
      params.append("maxCommission", filters.maxCommission);

    const response = await api.get(`/agents/available?${params.toString()}`);
    return response.data;
  },

  /**
   * Get business owner's agents
   */
  getMyAgents: async () => {
    const response = await api.get("/agents/my-agents");
    return response.data;
  },

  /**
   * Get single agent details
   * @param {string} relationId - BusinessAgentRelation ID
   */
  getAgentDetails: async (relationId) => {
    const response = await api.get(`/agents/${relationId}`);
    return response.data;
  },

  /**
   * Send invitation to agent
   * @param {Object} data - { agentId, agreedCommission, permissions }
   */
  inviteAgent: async (data) => {
    const response = await api.post("/agents/invite", data);
    return response.data;
  },

  /**
   * Update agent permissions
   * @param {string} relationId
   * @param {Object} permissions
   */
  updatePermissions: async (relationId, permissions) => {
    const response = await api.patch(`/agents/${relationId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  /**
   * Remove agent
   * @param {string} relationId
   * @param {string} reason
   */
  removeAgent: async (relationId, reason = "") => {
    const response = await api.delete(`/agents/${relationId}`, {
      data: { reason },
    });
    return response.data;
  },
};

export default agentService;
