import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

/**
 * Authentication Service
 * Handles login, signup, and logout operations
 */
export const authService = {
  /**
   * Login user
   * @param {string} loginId - Employee ID or Email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(loginId, password) {
    return await apiService.post(API_ENDPOINTS.auth.login, {
      loginId,
      password,
    });
  },

  /**
   * Signup new user/company
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user data
   */
  async signup(userData) {
    return await apiService.post(API_ENDPOINTS.auth.signup, userData);
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    return await apiService.post(API_ENDPOINTS.auth.logout);
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token
   */
  async refreshToken() {
    return await apiService.post(API_ENDPOINTS.auth.refresh);
  },
};
