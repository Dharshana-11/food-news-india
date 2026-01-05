/**
 * agentBusinessService.js
 * ============================================================================
 * API service layer for Agent ↔ Business operations
 *
 * Responsibilities:
 * - Fetch assigned businesses
 * - Access business workspace data
 */

import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

const agentBusinessService = {
  /**
   * Fetch all active businesses assigned to the agent
   * @returns {Promise<Object>}
   */
  getMyBusinesses: async () => {
    try {
      const response = await api.get(ENDPOINTS.AGENT_MY_BUSINESSES);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch businesses",
        }
      );
    }
  },

  /**
   * Get workspace data for a specific business
   * @param {string} relationId - BusinessAgentRelation ID
   * @returns {Promise<Object>}
   */
  getBusinessWorkspace: async (relationId) => {
    try {
      const response = await api.get(
        ENDPOINTS.AGENT_BUSINESS_WORKSPACE(relationId)
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch business workspace",
        }
      );
    }
  },
};

export default agentBusinessService;
