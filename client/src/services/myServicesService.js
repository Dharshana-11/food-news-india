import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Service Management API
 */
const myServicesService = {
  /**
   * Get all services with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search term
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort direction (asc/desc)
   * @param {number} params.limit - Results per page
   * @param {number} params.page - Page number
   */
  getServices: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SERVICES_LIST, { params });
    return response.data;
  },

  /**
   * Get service by ID
   * @param {string} id - Service ID
   */
  getServiceById: async (id) => {
    const response = await api.get(ENDPOINTS.SERVICE_DETAIL(id));
    return response.data;
  },

  /**
   * Get all service categories
   */
  getCategories: async () => {
    const response = await api.get(ENDPOINTS.SERVICE_CATEGORIES);
    return response.data;
  },

  /**
   * Get service providers for a specific service
   * @param {string} serviceId - Service ID
   * @param {Object} params - Query parameters
   */
  getServiceProviders: async (serviceId, params = {}) => {
    const response = await api.get(ENDPOINTS.SERVICE_PROVIDERS(serviceId), {
      params,
    });
    return response.data;
  },

  /**
   * Create a new service (Admin only)
   * @param {Object} serviceData - Service data
   */
  createService: async (serviceData) => {
    const response = await api.post(ENDPOINTS.SERVICE_CREATE, serviceData);
    return response.data;
  },

  /**
   * Update service (Admin only)
   * @param {string} id - Service ID
   * @param {Object} updates - Updated data
   */
  updateService: async (id, updates) => {
    const response = await api.put(ENDPOINTS.SERVICE_UPDATE(id), updates);
    return response.data;
  },

  /**
   * Delete/deactivate service (Admin only)
   * @param {string} id - Service ID
   */
  deleteService: async (id) => {
    const response = await api.delete(ENDPOINTS.SERVICE_DELETE(id));
    return response.data;
  },
};

export default myServicesService;
