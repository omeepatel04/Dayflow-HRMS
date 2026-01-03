import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Attendance Service
 * Handles check-in, check-out, attendance records, and regularization
 */
export const attendanceAPI = {
  /**
   * Check-in (start work)
   */
  async checkIn() {
    const response = await api.post(API_ENDPOINTS.attendance.checkIn);
    return response.data;
  },

  /**
   * Check-out (end work)
   */
  async checkOut() {
    const response = await api.post(API_ENDPOINTS.attendance.checkOut);
    return response.data;
  },

  /**
   * Get my attendance records
   * @param {Object} params - Query params (month, year, start_date, end_date)
   */
  async getMyAttendance(params = {}) {
    const response = await api.get(API_ENDPOINTS.attendance.myAttendance, {
      params,
    });
    return response.data;
  },

  /**
   * Get monthly attendance summary
   * @param {Object} params - Query params (month, year)
   */
  async getMonthlySummary(params = {}) {
    const response = await api.get(API_ENDPOINTS.attendance.monthlySummary, {
      params,
    });
    return response.data;
  },

  /**
   * Get all attendance records (HR/Admin only)
   * @param {Object} params - Query params (employee, date, month, year)
   */
  async getAllAttendance(params = {}) {
    const response = await api.get(API_ENDPOINTS.attendance.all, { params });
    return response.data;
  },

  /**
   * Get attendance detail by ID
   */
  async getAttendanceDetail(id) {
    const response = await api.get(API_ENDPOINTS.attendance.detail(id));
    return response.data;
  },

  // Regularization endpoints

  /**
   * Request attendance regularization
   * @param {Object} data - { attendance_id, requested_check_in, requested_check_out, reason }
   */
  async requestRegularization(data) {
    const response = await api.post(
      API_ENDPOINTS.attendance.regularizationRequest,
      data
    );
    return response.data;
  },

  /**
   * Get my regularization requests
   */
  async getMyRegularizations() {
    const response = await api.get(API_ENDPOINTS.attendance.myRegularizations);
    return response.data;
  },

  /**
   * Get all regularization requests (HR/Admin only)
   * @param {Object} params - Query params (status, employee)
   */
  async getAllRegularizations(params = {}) {
    const response = await api.get(
      API_ENDPOINTS.attendance.allRegularizations,
      { params }
    );
    return response.data;
  },

  /**
   * Approve/reject regularization request (HR/Admin only)
   * @param {Number} id - Regularization request ID
   * @param {Object} data - { is_approved, admin_remarks }
   */
  async updateRegularization(id, data) {
    const response = await api.post(
      API_ENDPOINTS.attendance.regularizationApproval(id),
      data
    );
    return response.data;
  },
};

export default attendanceAPI;
