import { ROUTES } from "./constants";

export const EMPLOYEE_TABS = [
  { key: "employees", label: "Employees", path: ROUTES.EMPLOYEE_DASHBOARD },
  { key: "attendance", label: "Attendance", path: ROUTES.EMPLOYEE_ATTENDANCE },
  { key: "timeoff", label: "Time Off", path: ROUTES.EMPLOYEE_TIME_OFF },
  { key: "profile", label: "Profile", path: ROUTES.EMPLOYEE_PROFILE },
  { key: "payroll", label: "Payroll", path: ROUTES.EMPLOYEE_PAYROLL },
];

export const ADMIN_TABS = [
  { key: "dashboard", label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
  { key: "employees", label: "Employees", path: ROUTES.ADMIN_EMPLOYEES },
  { key: "attendance", label: "Attendance", path: ROUTES.ADMIN_ATTENDANCE },
  { key: "leaves", label: "Leave Requests", path: ROUTES.ADMIN_TIME_OFF },
  { key: "settings", label: "Settings", path: ROUTES.ADMIN_SETTINGS },
];

export const getTabsByRole = (role) => {
  if (!role) return EMPLOYEE_TABS;
  if (role === "ADMIN" || role === "HR") return ADMIN_TABS;
  return EMPLOYEE_TABS;
};

const ADMIN_ROUTE_TO_KEY = {
  [ROUTES.ADMIN_DASHBOARD]: "dashboard",
  [ROUTES.ADMIN_EMPLOYEES]: "employees",
  [ROUTES.ADMIN_ATTENDANCE]: "attendance",
  [ROUTES.ADMIN_TIME_OFF]: "leaves",
  [ROUTES.ADMIN_SETTINGS]: "settings",
};

const EMP_ROUTE_TO_KEY = {
  [ROUTES.EMPLOYEE_DASHBOARD]: "employees",
  [ROUTES.EMPLOYEE_ATTENDANCE]: "attendance",
  [ROUTES.EMPLOYEE_TIME_OFF]: "timeoff",
  [ROUTES.EMPLOYEE_PROFILE]: "profile",
  [ROUTES.EMPLOYEE_PAYROLL]: "payroll",
};

const matchActiveKey = (pathname, routeMap, fallbackKey) => {
  const entry = Object.entries(routeMap).find(([route]) =>
    pathname.startsWith(route)
  );
  return entry ? entry[1] : fallbackKey;
};

export const getNavigationForRoute = (role, pathname) => {
  const tabs = getTabsByRole(role);
  const routeMap =
    role === "ADMIN" || role === "HR" ? ADMIN_ROUTE_TO_KEY : EMP_ROUTE_TO_KEY;
  const activeTab = matchActiveKey(pathname || "", routeMap, tabs[0]?.key);
  return { tabs, activeTab };
};
