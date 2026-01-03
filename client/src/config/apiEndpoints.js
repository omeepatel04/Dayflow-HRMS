/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions matching Django backend
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Authentication & Users
  auth: {
    login: "/users/login/",
    register: "/users/register/",
    logout: "/users/logout/",
    refreshToken: "/users/token/refresh/",
    profile: "/users/profile/",
    employeeProfile: "/users/employee-profile/",
    changePassword: "/users/change-password/",
    passwordReset: "/users/password-reset/",
    passwordResetConfirm: "/users/password-reset-confirm/",
  },

  // Users Management
  users: {
    list: "/users/users/",
    detail: (id) => `/users/users/${id}/`,
    employees: "/users/employees/",
  },

  // Dashboard
  dashboard: {
    employee: "/dashboard/employee/",
    hr: "/dashboard/hr/",
  },

  // Attendance
  attendance: {
    checkIn: "/attendance/check-in/",
    checkOut: "/attendance/check-out/",
    myAttendance: "/attendance/my-attendance/",
    monthlySummary: "/attendance/monthly-summary/",
    all: "/attendance/all/",
    detail: (id) => `/attendance/${id}/`,

    // Regularization
    regularizationRequest: "/attendance/regularization/request/",
    myRegularizations: "/attendance/regularization/my-requests/",
    allRegularizations: "/attendance/regularization/all/",
    regularizationApproval: (id) => `/attendance/regularization/${id}/approve/`,
  },

  // Leaves
  leaves: {
    apply: "/leaves/apply/",
    myLeaves: "/leaves/my-leaves/",
    all: "/leaves/all/",
    detail: (id) => `/leaves/${id}/`,
    approve: (id) => `/leaves/${id}/approve/`,
    cancel: (id) => `/leaves/${id}/cancel/`,
  },

  // Payroll
  payroll: {
    create: "/payroll/create/",
    update: (id) => `/payroll/${id}/update/`,
    myPayroll: "/payroll/my-payroll/",
    all: "/payroll/all/",
    detail: (id) => `/payroll/${id}/`,
    components: "/payroll/components/",
    salaryStructure: "/payroll/salary-structure/",
    generate: "/payroll/generate/",
    updateStatus: (id) => `/payroll/${id}/status/`,
    summary: "/payroll/summary/",
  },

  // Notifications
  notifications: {
    myNotifications: "/notifications/my-notifications/",
    detail: (id) => `/notifications/${id}/`,
    markAllRead: "/notifications/mark-all-read/",
    create: "/notifications/create/",
    broadcast: "/notifications/broadcast/",
    preferences: "/notifications/preferences/",
    stats: "/notifications/stats/",
  },
};

export default BASE_URL;
