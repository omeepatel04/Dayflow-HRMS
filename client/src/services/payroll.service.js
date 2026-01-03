import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Payroll Service
 * Handles payroll viewing and management
 */
export const payrollAPI = {
  /**
   * Get my payroll records
   * @param {Object} params - Query params (month, year, status)
   */
  async getMyPayroll(params = {}) {
    const response = await api.get(API_ENDPOINTS.payroll.myPayroll, { params });
    return response.data;
  },

  /**
   * Get all payroll records (HR/Admin only)
   * @param {Object} params - Query params (employee, month, year, status)
   */
  async getAllPayroll(params = {}) {
    const response = await api.get(API_ENDPOINTS.payroll.all, { params });
    return response.data;
  },

  /**
   * Get payroll detail by ID
   */
  async getPayrollDetail(id) {
    const response = await api.get(API_ENDPOINTS.payroll.detail(id));
    return response.data;
  },

  /**
   * Get payroll summary
   * @param {Object} params - Query params (month, year)
   */
  async getPayrollSummary(params = {}) {
    const response = await api.get(API_ENDPOINTS.payroll.summary, { params });
    return response.data;
  },

  /**
   * Get payroll components
   */
  async getPayrollComponents() {
    const response = await api.get(API_ENDPOINTS.payroll.components);
    return response.data;
  },

  /**
   * Get salary structure
   * @param {Object} params - Query params (employee)
   */
  async getSalaryStructure(params = {}) {
    const response = await api.get(API_ENDPOINTS.payroll.salaryStructure, {
      params,
    });
    return response.data;
  },

  // HR/Admin only endpoints

  /**
   * Create payroll (HR/Admin only)
   */
  async createPayroll(data) {
    const response = await api.post(API_ENDPOINTS.payroll.create, data);
    return response.data;
  },

  /**
   * Update payroll (HR/Admin only)
   */
  async updatePayroll(id, data) {
    const response = await api.put(API_ENDPOINTS.payroll.update(id), data);
    return response.data;
  },

  /**
   * Generate payroll for employees (HR/Admin only)
   * @param {Object} data - { employee_ids, month, year }
   */
  async generatePayroll(data) {
    const response = await api.post(API_ENDPOINTS.payroll.generate, data);
    return response.data;
  },

  /**
   * Update payroll status (HR/Admin only)
   * @param {Number} id - Payroll ID
   * @param {Object} data - { status: 'DRAFT'|'PROCESSED'|'PAID' }
   */
  async updatePayrollStatus(id, data) {
    const response = await api.patch(
      API_ENDPOINTS.payroll.updateStatus(id),
      data
    );
    return response.data;
  },
};

export default payrollAPI;
