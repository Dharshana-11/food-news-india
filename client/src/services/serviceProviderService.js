/**
 * serviceProviderService.js
 * ============================================================================
 * API service for Service Provider → My Services
 */

import api from "../api/axios";

const serviceProviderService = {
  /**
   * Get all my services
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status
   */
  getMyServices: async (params = {}) => {
    const response = await api.get("/service-provider/my-services", { params });
    return response.data;
  },

  /**
   * Get single service details
   * @param {string} id - Service ID
   */
  getServiceById: async (id) => {
    const response = await api.get(`/service-provider/my-services/${id}`);
    return response.data;
  },

  /**
   * Create new service
   * @param {Object} data - Service data
   * @param {string} data.complianceItemId - Compliance item ID
   * @param {number} data.price - Service price
   * @param {number} data.turnaroundDays - Turnaround days
   */
  createService: async (data) => {
    const response = await api.post("/service-provider/my-services", data);
    return response.data;
  },

  /**
   * Update service
   * @param {string} id - Service ID
   * @param {Object} updates - Updated fields
   * @param {number} updates.price - Service price
   * @param {number} updates.turnaroundDays - Turnaround days
   */
  updateService: async (id, updates) => {
    const response = await api.put(
      `/service-provider/my-services/${id}`,
      updates
    );
    return response.data;
  },

  /**
   * Deactivate service
   * @param {string} id - Service ID
   */
  deactivateService: async (id) => {
    const response = await api.patch(
      `/service-provider/my-services/${id}/deactivate`
    );
    return response.data;
  },

  /**
   * Activate service
   * @param {string} id - Service ID
   */
  activateService: async (id) => {
    const response = await api.patch(
      `/service-provider/my-services/${id}/activate`
    );
    return response.data;
  },

  submitForApproval: async (id) => {
    const res = await api.patch(`/service-provider/my-services/${id}/submit`);
    return res.data;
  },
};

export default serviceProviderService;
