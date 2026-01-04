/**
 * agentInviteService.js
 * ============================================================================
 * API service layer for Agent ↔ Business Owner invitation operations
 *
 * Responsibilities:
 * - Fetch pending invitations
 * - Accept invitations
 * - Reject invitations
 */

import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

const agentInviteService = {
  /**
   * Fetch all pending invites for the logged-in agent
   * @returns {Promise<Object>}
   */
  getMyInvites: async () => {
    try {
      const response = await api.get(ENDPOINTS.AGENT_INVITES);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch invitations",
        }
      );
    }
  },

  /**
   * Accept a pending invitation
   * @param {string} relationId - BusinessAgentRelation ID
   * @returns {Promise<Object>}
   */
  acceptInvite: async (relationId) => {
    try {
      const response = await api.patch(
        ENDPOINTS.AGENT_INVITE_ACCEPT(relationId)
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to accept invitation",
        }
      );
    }
  },

  /**
   * Reject a pending invitation
   * @param {string} relationId - BusinessAgentRelation ID
   * @param {string} reason - Optional reason for rejection
   * @returns {Promise<Object>}
   */
  rejectInvite: async (relationId, reason = "") => {
    try {
      const response = await api.patch(
        ENDPOINTS.AGENT_INVITE_REJECT(relationId),
        { reason }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to reject invitation",
        }
      );
    }
  },
};

export default agentInviteService;
