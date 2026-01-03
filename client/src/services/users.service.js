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
    const payload = {
      username: data.username || data.employee_id || data.email,
      email: data.email,
      employee_id: data.employee_id,
      password: data.password,
      password2: data.password,
      role: "EMPLOYEE",
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      department: data.department,
      job_title: data.position,
      date_of_joining: data.joining_date,
      status: data.is_active ? "active" : "inactive",
      is_active: data.is_active,
    };
    const response = await api.post(API_ENDPOINTS.auth.register, payload);
    const user = response.data?.user || response.data;
    // Mirror profile fields we just sent so UI shows them immediately
    return {
      ...user,
      phone: payload.phone,
      department: payload.department,
      position: payload.job_title,
      joining_date: payload.date_of_joining,
      is_active: payload.is_active,
    };
  },

  /**
   * Update an employee
   * @param {number} id - Employee ID
   * @param {Object} data - Employee data to update
   */
  async updateEmployee(id, data) {
    const response = await api.put(API_ENDPOINTS.users.detail(id), data);
    return response.data?.user || response.data;
  },

  /**
   * Delete an employee
   * @param {number} id - Employee ID
   */
  async deleteEmployee(id) {
    const response = await api.delete(API_ENDPOINTS.users.detail(id));
    return response.data;
  },
};

export default usersAPI;
