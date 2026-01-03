import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Leaves Service
 * Handles leave applications, approvals, and management
 */
export const leavesAPI = {
  /**
   * Apply for leave
   * @param {Object} data - { leave_type, start_date, end_date, reason }
   */
  async applyLeave(data) {
    const response = await api.post(API_ENDPOINTS.leaves.apply, data);
    return response.data;
  },

  /**
   * Get my leave applications
   * @param {Object} params - Query params (status, leave_type, start_date, end_date)
   */
  async getMyLeaves(params = {}) {
    const response = await api.get(API_ENDPOINTS.leaves.myLeaves, { params });
    return response.data;
  },

  /**
   * Get all leave applications (HR/Admin only)
   * @param {Object} params - Query params (employee, status, leave_type)
   */
  async getAllLeaves(params = {}) {
    const response = await api.get(API_ENDPOINTS.leaves.all, { params });
    return response.data;
  },

  /**
   * Get leave detail by ID
   */
  async getLeaveDetail(id) {
    const response = await api.get(API_ENDPOINTS.leaves.detail(id));
    return response.data;
  },

  /**
   * Approve/reject leave (HR/Admin only)
   * @param {Number} id - Leave ID
   * @param {Object} data - { is_approved, approver_remarks }
   */
  async approveLeave(id, data) {
    const response = await api.post(API_ENDPOINTS.leaves.approve(id), data);
    return response.data;
  },

  /**
   * Cancel leave (Employee can cancel own leave)
   */
  async cancelLeave(id) {
    const response = await api.post(API_ENDPOINTS.leaves.cancel(id));
    return response.data;
  },
};

export default leavesAPI;
