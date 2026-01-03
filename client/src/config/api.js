/**
 * API Configuration
 * Base URL for backend API endpoints
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  
  // Employee
  employee: {
    profile: `${API_BASE_URL}/employee/profile`,
    list: `${API_BASE_URL}/employee/list`,
    update: (id) => `${API_BASE_URL}/employee/${id}`,
  },
  
  // Attendance
  attendance: {
    checkIn: `${API_BASE_URL}/attendance/check-in`,
    checkOut: `${API_BASE_URL}/attendance/check-out`,
    list: `${API_BASE_URL}/attendance/list`,
    employee: (id) => `${API_BASE_URL}/attendance/employee/${id}`,
  },
  
  // Leave/Time-off
  leave: {
    request: `${API_BASE_URL}/leave/request`,
    list: `${API_BASE_URL}/leave/list`,
    approve: (id) => `${API_BASE_URL}/leave/${id}/approve`,
    reject: (id) => `${API_BASE_URL}/leave/${id}/reject`,
  },
  
  // Payroll
  payroll: {
    details: `${API_BASE_URL}/payroll/details`,
    list: `${API_BASE_URL}/payroll/list`,
  },
};

export default API_BASE_URL;
