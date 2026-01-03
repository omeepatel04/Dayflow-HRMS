import api from "../lib/axios";
import { API_ENDPOINTS } from "../config/apiEndpoints";

/**
 * Notifications Service
 * Handles notifications, preferences, and stats
 */
export const notificationsAPI = {
  /**
   * Get my notifications
   * @param {Object} params - Query params (unread, notification_type)
   */
  async getMyNotifications(params = {}) {
    const mappedParams = {
      unread_only:
        params.unread_only ?? params.unread ?? params.unreadOnly ?? false,
      type: params.type || params.notification_type,
    };

    const response = await api.get(
      API_ENDPOINTS.notifications.myNotifications,
      { params: mappedParams }
    );
    return response.data;
  },

  /**
   * Get notification detail by ID (marks as read)
   */
  async getNotificationDetail(id) {
    const response = await api.get(API_ENDPOINTS.notifications.detail(id));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead() {
    const response = await api.post(API_ENDPOINTS.notifications.markAllRead);
    return response.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(id) {
    const response = await api.delete(API_ENDPOINTS.notifications.detail(id));
    return response.data;
  },

  /**
   * Get notification preferences
   */
  async getPreferences() {
    const response = await api.get(API_ENDPOINTS.notifications.preferences);
    return response.data;
  },

  /**
   * Update notification preferences
   * @param {Object} data - { email_notifications, leave_notifications, etc. }
   */
  async updatePreferences(data) {
    const response = await api.put(
      API_ENDPOINTS.notifications.preferences,
      data
    );
    return response.data;
  },

  /**
   * Get notification statistics
   */
  async getStats() {
    const response = await api.get(API_ENDPOINTS.notifications.stats);
    return response.data;
  },

  // HR/Admin only endpoints

  /**
   * Create notification (HR/Admin only)
   * @param {Object} data - { recipient, notification_type, title, message, priority, etc. }
   */
  async createNotification(data) {
    const response = await api.post(API_ENDPOINTS.notifications.create, data);
    return response.data;
  },

  /**
   * Broadcast notification (HR/Admin only)
   * @param {Object} data - { notification_type, title, message, priority, recipient_role }
   */
  async broadcastNotification(data) {
    const response = await api.post(
      API_ENDPOINTS.notifications.broadcast,
      data
    );
    return response.data;
  },
};

export default notificationsAPI;
