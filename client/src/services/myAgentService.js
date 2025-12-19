/**
 * myAgentService
 * ============================================================================
 * API service layer for Business Owner ↔ Agent operations.
 *
 * Responsibilities:
 * - Fetch available agents
 * - Manage agent invitations
 * - View, update, and remove assigned agents
 *
 * NOTE:
 * This file intentionally contains NO UI logic.
 */

import api from "../api/axios";

/**
 * Build query params safely from optional filters
 * @param {Object} filters
 * @returns {string}
 */
const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.city) params.append("city", filters.city);
  if (filters.minRating) params.append("minRating", filters.minRating);
  if (filters.maxCommission)
    params.append("maxCommission", filters.maxCommission);

  return params.toString();
};

const agentService = {
  /**
   * Fetch list of available agents
   * @param {Object} filters - { search, city, minRating, maxCommission }
   * @returns {Promise<Object>}
   */
  getAvailableAgents: async (filters = {}) => {
    const query = buildQueryParams(filters);
    const response = await api.get(
      `/agents/available${query ? `?${query}` : ""}`
    );
    return response.data;
  },

  /**
   * Fetch business owner's agents (active + pending)
   * @returns {Promise<Object>}
   */
  getMyAgents: async () => {
    const response = await api.get("/agents/my-agents");
    return response.data;
  },

  /**
   * Fetch single agent details
   * @param {string} relationId - BusinessAgentRelation ID
   * @returns {Promise<Object>}
   */
  getAgentDetails: async (relationId) => {
    const response = await api.get(`/agents/${relationId}`);
    return response.data;
  },

  /**
   * Send invitation to an agent
   * @param {Object} payload - { agentId, permissions }
   * @returns {Promise<Object>}
   */
  inviteAgent: async (payload) => {
    try {
      const response = await api.post("/agents/invite", payload);
      return response.data;
    } catch (error) {
      /**
       * IMPORTANT:
       * Preserve backend error message for UI consumption
       */
      throw (
        error.response?.data || {
          message: "Failed to send agent invitation",
        }
      );
    }
  },

  /**
   * Update permissions for an active agent
   * @param {string} relationId
   * @param {Object} permissions
   * @returns {Promise<Object>}
   */
  updatePermissions: async (relationId, permissions) => {
    const response = await api.patch(`/agents/${relationId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  /**
   * Cancel a pending agent invitation
   * @param {string} relationId
   * @returns {Promise<Object>}
   */
  cancelInvite: async (relationId) => {
    const response = await api.delete(`/agents/${relationId}`);
    return response.data;
  },

  /**
   * Remove an agent (active or pending)
   * @param {string} relationId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  removeAgent: async (relationId, reason = "") => {
    const response = await api.delete(`/agents/${relationId}`, {
      data: { reason },
    });
    return response.data;
  },
};

export default agentService;
