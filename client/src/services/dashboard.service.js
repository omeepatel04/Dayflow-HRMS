import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Dashboard Service
 * Provides dashboard statistics and overview data
 */
export const dashboardAPI = {
  /**
   * Get employee dashboard data
   */
  async getEmployeeDashboard() {
    const response = await api.get(API_ENDPOINTS.dashboard.employee);
    return response.data;
  },

  /**
   * Get HR/Admin dashboard data
   */
  async getHRDashboard() {
    const response = await api.get(API_ENDPOINTS.dashboard.hr);
    return response.data;
  },
};

export default dashboardAPI;
