import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Booking Management API
 */
const bookingService = {
  /**
   * Create a new booking
   * @param {Object} bookingData
   * @param {string} bookingData.serviceId - Service to book
   * @param {string} bookingData.providerId - Provider to use
   * @param {number} bookingData.agreedPrice - Agreed price
   * @param {string} bookingData.notes - Additional notes
   */
  createBooking: async (bookingData) => {
    const response = await api.post(ENDPOINTS.BOOKING_CREATE, bookingData);
    return response.data;
  },

  /**
   * Get my bookings with filters
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort direction
   * @param {number} params.limit - Results per page
   * @param {number} params.page - Page number
   */
  getMyBookings: async (params = {}) => {
    const response = await api.get(ENDPOINTS.BOOKINGS_LIST, { params });
    return response.data;
  },

  /**
   * Get booking by ID
   * @param {string} id - Booking ID
   */
  getBookingById: async (id) => {
    const response = await api.get(ENDPOINTS.BOOKING_DETAIL(id));
    return response.data;
  },

  /**
   * Get booking statistics
   */
  getBookingStats: async () => {
    const response = await api.get(ENDPOINTS.BOOKING_STATS);
    return response.data;
  },

  /**
   * Update booking status
   * @param {string} id - Booking ID
   * @param {Object} statusData
   * @param {string} statusData.status - New status
   * @param {string} statusData.message - Status message
   */
  updateBookingStatus: async (id, statusData) => {
    const response = await api.patch(
      ENDPOINTS.BOOKING_UPDATE_STATUS(id),
      statusData
    );
    return response.data;
  },

  /**
   * Cancel booking
   * @param {string} id - Booking ID
   * @param {string} reason - Cancellation reason
   */
  cancelBooking: async (id, reason) => {
    const response = await api.patch(ENDPOINTS.BOOKING_CANCEL(id), { reason });
    return response.data;
  },

  /**
   * Add rating to completed booking
   * @param {string} id - Booking ID
   * @param {Object} ratingData
   * @param {number} ratingData.score - Rating score (1-5)
   * @param {string} ratingData.comment - Rating comment
   */
  addRating: async (id, ratingData) => {
    const response = await api.post(ENDPOINTS.BOOKING_RATE(id), ratingData);
    return response.data;
  },
};

export default bookingService;
