/**
 * agentDocumentService.js
 * ============================================================================
 * API service layer for Agent Document Vault operations
 */

import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

const agentDocumentService = {
  /**
   * Get document overview for all assigned businesses
   * @returns {Promise<Object>}
   */
  getDocumentOverview: async () => {
    try {
      const response = await api.get(ENDPOINTS.AGENT_DOCUMENTS);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch document overview",
        }
      );
    }
  },

  /**
   * Get documents for a specific business
   * @param {string} relationId - BusinessAgentRelation ID
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>}
   */
  getBusinessDocuments: async (relationId, filters = {}) => {
    try {
      const response = await api.get(
        ENDPOINTS.AGENT_BUSINESS_DOCUMENTS(relationId),
        { params: filters }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch business documents",
        }
      );
    }
  },

  /**
   * Upload document for a business
   * @param {FormData} formData - Document upload data
   * @returns {Promise<Object>}
   */
  uploadDocument: async (formData) => {
    try {
      const response = await api.post(
        ENDPOINTS.AGENT_DOCUMENT_UPLOAD,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to upload document",
        }
      );
    }
  },

  /**
   * Get available document categories
   * @param {string} relationId - BusinessAgentRelation ID
   * @returns {Promise<Object>}
   */
  getDocumentCategories: async (relationId) => {
    try {
      const response = await api.get(ENDPOINTS.AGENT_DOCUMENT_CATEGORIES, {
        params: { relationId },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch document categories",
        }
      );
    }
  },

  /**
   * Get document URL for viewing/downloading
   * @param {string} filePath - Document file path
   * @returns {string}
   */
  getDocumentUrl: (filePath) => {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000";
    return `${baseURL}${filePath}`;
  },

  /**
   * Delete document (move to trash)
   * @param {string} documentId
   * @returns {Promise<Object>}
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(
        ENDPOINTS.AGENT_DOCUMENT_DELETE(documentId)
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to delete document",
        }
      );
    }
  },

  /**
   * Rename document
   * @param {string} documentId
   * @param {{ originalName: string }} payload
   * @returns {Promise<Object>}
   */
  renameDocument: async (documentId, payload) => {
    try {
      const response = await api.patch(
        ENDPOINTS.AGENT_DOCUMENT_RENAME(documentId),
        payload
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to rename document",
        }
      );
    }
  },
};

export default agentDocumentService;
