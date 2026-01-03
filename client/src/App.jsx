import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROUTES } from './config/constants';
import Login from './pages/auth/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import AttendancePage from './pages/employee/Attendance';
import TimeOffPage from './pages/employee/TimeOff';
import ProfilePage from './pages/employee/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route
            path={ROUTES.EMPLOYEE_DASHBOARD}
            element={(
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.EMPLOYEE_ATTENDANCE}
            element={(
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.EMPLOYEE_TIME_OFF}
            element={(
              <ProtectedRoute>
                <TimeOffPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={ROUTES.EMPLOYEE_PROFILE}
            element={(
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            )}
          />

          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={(
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )}
          />
          <Route
            path={ROUTES.ADMIN_EMPLOYEES}
            element={(
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )}
          />
          <Route
            path={ROUTES.ADMIN_ATTENDANCE}
            element={(
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )}
          />
          <Route
            path={ROUTES.ADMIN_TIME_OFF}
            element={(
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )}
          />

          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;