import { API_ENDPOINTS } from '../config/api';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Base API Service
 * Handles HTTP requests with authentication
 */
class ApiService {
  async request(url, options = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(url) {
    return this.request(url, { method: 'GET' });
  }

  post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;
