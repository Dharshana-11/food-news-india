import api from "../api/axios";

const SP_BOOKING_API = "/service-provider/bookings";

/**
 * Internal helper for consistent error handling
 */
const safeApiCall = async (fn) => {
  try {
    const res = await fn();
    return res.data;
  } catch (error) {
    console.error("SPBookingService Error:", error);
    throw error?.response?.data || error;
  }
};

const serviceProviderBookingService = {
  /**
   * Get booking requests (pending)
   * @param {Object} filters
   * @param {string} [filters.search] - Search by booking ID or business name
   * @param {string} [filters.dateFrom] - Filter by date from
   * @param {string} [filters.dateTo] - Filter by date to
   * @param {string} [filters.complianceItemId] - Filter by compliance item
   * @returns {Promise<Object>}
   */
  getBookingRequests: async (filters = {}) => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.complianceItemId)
      params.complianceItemId = filters.complianceItemId;

    return safeApiCall(() => api.get(`${SP_BOOKING_API}/requests`, { params }));
  },

  /**
   * Get my bookings (accepted, in_progress, documents_submitted)
   * @param {Object} params
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.sortBy] - Sort field
   * @param {string} [params.sortOrder] - Sort direction
   * @param {number} [params.limit] - Results per page
   * @param {number} [params.page] - Page number
   * @returns {Promise<Object>}
   */
  getMyBookings: async (params = {}) => {
    return safeApiCall(() => api.get(SP_BOOKING_API, { params }));
  },

  /**
   * Get booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<Object>}
   */
  getBookingById: async (id) => {
    return safeApiCall(() => api.get(`${SP_BOOKING_API}/${id}`));
  },

  /**
   * Get booking statistics
   * @returns {Promise<Object>}
   */
  getBookingStats: async () => {
    return safeApiCall(() => api.get(`${SP_BOOKING_API}/stats`));
  },

  /**
   * Accept a booking request
   * @param {string} id - Booking ID
   * @returns {Promise<Object>}
   */
  acceptBooking: async (id) => {
    return safeApiCall(() => api.patch(`${SP_BOOKING_API}/${id}/accept`));
  },

  /**
   * Reject a booking request
   * @param {string} id - Booking ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>}
   */
  rejectBooking: async (id, reason) => {
    return safeApiCall(() =>
      api.patch(`${SP_BOOKING_API}/${id}/reject`, { reason })
    );
  },

  /**
   * Post a service update (timeline)
   * @param {string} id - Booking ID
   * @param {Object} updateData
   * @param {string} updateData.message - Update message
   * @param {string} [updateData.status] - New status
   * @returns {Promise<Object>}
   */
  postServiceUpdate: async (id, updateData) => {
    return safeApiCall(() =>
      api.post(`${SP_BOOKING_API}/${id}/update`, updateData)
    );
  },

  /**
   * Upload deliverables
   * @param {string} id - Booking ID
   * @param {FormData} formData - Form data with file and validFrom
   * @returns {Promise<Object>}
   */
  uploadDeliverables: async (id, formData) => {
    return safeApiCall(() =>
      api.post(`${SP_BOOKING_API}/${id}/deliverables`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  /**
   * Get document URL for viewing
   * @param {string} filePath - Document file path
   * @returns {string}
   */
  getDocumentUrl: (filePath) => {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000";
    return `${baseURL}${filePath}`;
  },
};

export default serviceProviderBookingService;
