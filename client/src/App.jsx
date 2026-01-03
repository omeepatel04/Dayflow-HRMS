import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROUTES } from './config/constants';

// Placeholder components - to be implemented in features
const LoginPage = () => <div className="p-8">Login Page - Coming Soon</div>;
const SignupPage = () => <div className="p-8">Signup Page - Coming Soon</div>;
const EmployeeDashboard = () => <div className="p-8">Employee Dashboard - Coming Soon</div>;
const AdminDashboard = () => <div className="p-8">Admin Dashboard - Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          
          {/* Employee Routes */}
          <Route path={ROUTES.EMPLOYEE_DASHBOARD} element={<EmployeeDashboard />} />
          
          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

