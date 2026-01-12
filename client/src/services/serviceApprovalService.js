// src/services/serviceApprovalService.js
import api from "../api/axios";

/**
 * Get all services pending admin approval
 * @returns {Promise<Array>} List of pending services
 */
export const getPendingServices = async () => {
  try {
    const response = await api.get("/admin/services/pending");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching pending services:", error);
    throw error;
  }
};

/**
 * Approve a service
 * @param {string} serviceId - ID of the service to approve
 * @returns {Promise<Object>} Approved service data
 */
export const approveService = async (serviceId) => {
  try {
    const response = await api.patch(`/admin/services/${serviceId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving service:", error);
    throw error;
  }
};

/**
 * Reject a service
 * @param {string} serviceId - ID of the service to reject
 * @param {string} adminNotes - Reason for rejection
 * @returns {Promise<Object>} Rejected service data
 */
export const rejectService = async (serviceId, adminNotes) => {
  try {
    const response = await api.patch(`/admin/services/${serviceId}/reject`, {
      adminNotes,
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting service:", error);
    throw error;
  }
};
