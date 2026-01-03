import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

/**
 * Admin Route Component
 * Redirects to employee dashboard if user is not admin/HR officer
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />;
  }

  return children;
};
