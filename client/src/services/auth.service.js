import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Authentication Service
 * Handles login, register, logout, and password management
 */
export const authAPI = {
  /**
   * Login with username and password
   */
  async login(credentials) {
    const response = await api.post(API_ENDPOINTS.auth.login, {
      username: credentials.loginId,
      password: credentials.password,
    });
    return response.data;
  },

  /**
   * Register new user/company
   */
  async register(userData) {
    const response = await api.post(API_ENDPOINTS.auth.register, userData);
    return response.data;
  },

  /**
   * Logout - Blacklist refresh token
   */
  async logout(refreshToken) {
    const response = await api.post(API_ENDPOINTS.auth.logout, {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.auth.profile);
    return response.data;
  },

  /**
   * Get employee profile details
   */
  async getEmployeeProfile() {
    const response = await api.get(API_ENDPOINTS.auth.employeeProfile);
    return response.data;
  },

  /**
   * Update employee profile
   */
  async updateEmployeeProfile(data) {
    const response = await api.put(API_ENDPOINTS.auth.employeeProfile, data);
    return response.data;
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(data) {
    const response = await api.post(API_ENDPOINTS.auth.changePassword, {
      old_password: data.oldPassword,
      new_password: data.newPassword,
    });
    return response.data;
  },

  /**
   * Request password reset (forgot password)
   */
  async requestPasswordReset(email) {
    const response = await api.post(API_ENDPOINTS.auth.passwordReset, {
      email,
    });
    return response.data;
  },

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data) {
    const response = await api.post(API_ENDPOINTS.auth.passwordResetConfirm, {
      uid: data.uid,
      token: data.token,
      new_password: data.newPassword,
    });
    return response.data;
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const response = await api.put(
      API_ENDPOINTS.auth.employeeProfile,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Upload documents (resume, ID proof)
   */
  async uploadDocuments(data) {
    const formData = new FormData();
    if (data.resume) formData.append("resume", data.resume);
    if (data.idProof) formData.append("id_proof", data.idProof);

    const response = await api.put(
      API_ENDPOINTS.auth.employeeProfile,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default authAPI;
