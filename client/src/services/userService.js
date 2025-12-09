/**
 * @file userService.js
 * @description Service module for handling all user-related API calls
 * @module services/userService
 * @requires axios
 * @version 1.0.0
 * @example
 * import {
 *   getAllUsers,
 *   createUser,
 *   updateUserById,
 *   deleteUser
 * } from '../services/userService';
 */

import axios from "axios";

/** @constant {string} API_URL - Base URL for the API server */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Configure axios to send cookies with requests for session management
axios.defaults.withCredentials = true;

/**
 * Fetches a paginated list of users with optional filtering and sorting
 * @async
 * @function getAllUsers
 * @param {Object} [params] - Query parameters for filtering and pagination
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=10] - Number of users per page
 * @param {string} [params.search] - Search term for filtering users
 * @param {string} [params.role] - Filter users by role
 * @param {string} [params.sortBy=createdAt] - Field to sort by
 * @param {string} [params.order=desc] - Sort order ('asc' or 'desc')
 * @returns {Promise<Object>} Response containing users and pagination info
 * @throws {Error} If the request fails
 * @example
 * const { data: { users, total } } = await getAllUsers({ page: 1, limit: 10, role: 'admin' });
 */
export const getAllUsers = async (params) => {
  const res = await axios.get(`${API_URL}/api/users`, { params });
  return res;
};

/**
 * Fetches a single user by their unique ID
 * @async
 * @function getUserById
 * @param {string} uid - The unique identifier of the user
 * @returns {Promise<Object>} User data
 * @throws {Error} If the user is not found or request fails
 * @example
 * const user = await getUserById('user-123');
 */
export const getUserById = async (uid) => {
  const res = await axios.get(`${API_URL}/api/users/${uid}`);
  return res;
};

/**
 * Creates a new user
 * @async
 * @function createUser
 * @param {Object} data - User data
 * @param {string} data.email - User's email address
 * @param {string} data.password - User's password
 * @param {string} data.name - User's full name
 * @param {string} data.role - User's role (e.g., 'admin', 'user')
 * @param {Object} [data.metadata] - Additional user metadata
 * @returns {Promise<Object>} Created user data
 * @throws {Error} If user creation fails
 * @example
 * await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'secure123',
 *   role: 'admin'
 * });
 */
export const createUser = async (data) => {
  const res = await axios.post(`${API_URL}/api/users`, data);
  return res;
};

/**
 * Verifies a user's account
 * @async
 * @function verifyUser
 * @param {string} uid - The ID of the user to verify
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If verification fails
 * @example
 * await verifyUser('user-123');
 */
export const verifyUser = async (uid) => {
  const res = await axios.patch(`${API_URL}/api/users/${uid}/verify`);
  return res;
};

/**
 * Rejects a user's account with an optional reason
 * @async
 * @function rejectUser
 * @param {string} uid - The ID of the user to reject
 * @param {Object} data - Rejection data
 * @param {string} [data.reason] - Reason for rejection
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If rejection fails
 * @example
 * await rejectUser('user-123', { reason: 'Incomplete information' });
 */
export const rejectUser = async (uid, data) => {
  const res = await axios.patch(`${API_URL}/api/users/${uid}/reject`, data);
  return res;
};

/**
 * Updates a user's information
 * @async
 * @function updateUserById
 * @param {string} uid - The ID of the user to update
 * @param {Object} data - Updated user data
 * @param {string} [data.name] - Updated name
 * @param {string} [data.email] - Updated email
 * @param {string} [data.role] - Updated role
 * @param {Object} [data.metadata] - Updated metadata
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 * @example
 * await updateUserById('user-123', { name: 'Updated Name', role: 'admin' });
 */
export const updateUserById = async (uid, data) => {
  const res = await axios.put(`${API_URL}/api/users/${uid}`, data);
  return res;
};

/**
 * Deletes a user account
 * @async
 * @function deleteUser
 * @param {string} uid - The ID of the user to delete
 * @returns {Promise<Object>} Deletion status
 * @throws {Error} If deletion fails
 * @example
 * await deleteUser('user-123');
 */
export const deleteUser = async (uid) => {
  const res = await axios.delete(`${API_URL}/api/users/${uid}`);
  return res;
};

// -------- Self user --------
/**
 * Fetches the currently authenticated user's profile
 * @async
 * @function getUserProfile
 * @returns {Promise<Object>} User data
 * @throws {Error} If the request fails
 * @example
 * const user = await getUserProfile();
 */
export const getUserProfile = () => axios.get(`${API_URL}/api/users/me`);

/**
 * Updates the currently authenticated user's profile
 * @async
 * @function updateSelfProfile
 * @param {Object} data - Updated profile data
 * @param {string} [data.name] - Updated name
 * @param {string} [data.email] - Updated email
 * @param {string} [data.phone] - Updated phone number
 * @param {Object} [data.preferences] - Updated user preferences
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 * @example
 * await updateSelfProfile({ name: 'New Name', email: 'new@example.com' });
 */
export const updateSelfProfile = async (data) => {
  const res = await axios.put(`${API_URL}/api/users/me`, data);
  return res;
};

/**
 * Deletes the currently authenticated user's account
 * @async
 * @function deleteSelfProfile
 * @returns {Promise<Object>} Deletion status
 * @throws {Error} If deletion fails
 * @example
 * await deleteSelfProfile();
 */
export const deleteSelfProfile = async () => {
  const res = await axios.delete(`${API_URL}/api/users/me`);
  return res;
};
