import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROUTES } from "./config/constants";
import Login from "./pages/auth/Login";
import EmployeeDashboard from "./pages/employee/Dashboard";
import AttendancePage from "./pages/employee/Attendance";
import TimeOffPage from "./pages/employee/TimeOff";
import ProfilePage from "./pages/employee/Profile";
import PayrollPage from "./pages/employee/Payroll";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeaveManagement from "./pages/admin/LeaveManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import {
  ProtectedRoute,
  AdminRoute,
  PublicRoute,
} from "./components/ProtectedRoute";
import { ToastProvider } from "./components/Toast";

const HomeRedirect = () => {
  const { isAuthenticated, isAdminOrHR, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <Navigate
      to={isAdminOrHR ? ROUTES.ADMIN_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD}
      replace
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.SIGNUP}
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.EMPLOYEE_DASHBOARD}
              element={
                <ProtectedRoute>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EMPLOYEE_ATTENDANCE}
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EMPLOYEE_TIME_OFF}
              element={
                <ProtectedRoute>
                  <TimeOffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EMPLOYEE_PROFILE}
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EMPLOYEE_PAYROLL}
              element={
                <ProtectedRoute>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_EMPLOYEES}
              element={
                <AdminRoute>
                  <EmployeeManagement />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ATTENDANCE}
              element={
                <AdminRoute>
                  <AttendancePage />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_TIME_OFF}
              element={
                <AdminRoute>
                  <LeaveManagement />
                </AdminRoute>
              }
            />

            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
