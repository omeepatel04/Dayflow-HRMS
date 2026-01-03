import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Users Service
 * Handles user and employee management
 */
export const usersAPI = {
  /**
   * Get list of users (HR/Admin only)
   * @param {Object} params - Query params (role, is_active)
   */
  async getUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.users.list, { params });
    return response.data;
  },

  /**
   * Get user detail by ID (HR/Admin only)
   */
  async getUserDetail(id) {
    const response = await api.get(API_ENDPOINTS.users.detail(id));
    return response.data;
  },

  /**
   * Update user (HR/Admin only)
   */
  async updateUser(id, data) {
    const response = await api.put(API_ENDPOINTS.users.detail(id), data);
    return response.data;
  },

  /**
   * Get list of employees with profiles
   * @param {Object} params - Query params (department, is_active)
   */
  async getEmployees(params = {}) {
    const response = await api.get(API_ENDPOINTS.users.employees, { params });
    return response.data;
  },

  /**
   * Get all employees (alias for getEmployees)
   */
  async getAllEmployees(params = {}) {
    const response = await api.get(API_ENDPOINTS.users.employees, { params });
    return response.data;
  },

  /**
   * Create a new employee
   * @param {Object} data - Employee data (first_name, last_name, email, employee_id, password, etc.)
   */
  async createEmployee(data) {
    const response = await api.post(API_ENDPOINTS.users.employees, data);
    return response.data;
  },

  /**
   * Update an employee
   * @param {number} id - Employee ID
   * @param {Object} data - Employee data to update
   */
  async updateEmployee(id, data) {
    const response = await api.patch(
      `${API_ENDPOINTS.users.employees}${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete an employee
   * @param {number} id - Employee ID
   */
  async deleteEmployee(id) {
    const response = await api.delete(`${API_ENDPOINTS.users.employees}${id}/`);
    return response.data;
  },
};

export default usersAPI;
