/**
 * Application Constants
 */

// User Roles (must match backend exactly)
export const USER_ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  LEAVE: "leave",
};

// Leave Types
export const LEAVE_TYPES = {
  PAID: "paid",
  SICK: "sick",
  UNPAID: "unpaid",
};

// Leave Status
export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Routes
export const ROUTES = {
  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",

  // Employee
  EMPLOYEE_DASHBOARD: "/employee/dashboard",
  EMPLOYEE_PROFILE: "/employee/profile",
  EMPLOYEE_ATTENDANCE: "/employee/attendance",
  EMPLOYEE_TIME_OFF: "/employee/time-off",
  EMPLOYEE_PAYROLL: "/employee/payroll",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_EMPLOYEES: "/admin/employees",
  ADMIN_ATTENDANCE: "/admin/attendance",
  ADMIN_TIME_OFF: "/admin/time-off",
  ADMIN_SETTINGS: "/admin/settings",
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
};
