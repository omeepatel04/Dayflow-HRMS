import { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "../config/constants";
import { authAPI } from "../services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (storedUser && token) {
        try {
          // Validate token by fetching profile
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (err) {
          // Token invalid, clear storage
          console.error("Token validation failed:", err);
          localStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login(credentials);

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh);

      // Store user data
      const userData = {
        id: response.user.id,
        email: response.user.email,
        employee_id: response.user.employee_id,
        role: response.user.role,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        full_name: response.user.full_name,
      };

      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear everything
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
      setError(null);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      const updated = await authAPI.updateEmployeeProfile(data);
      const updatedUser = { ...user, ...updated };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, data: updated };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Update failed";
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isHR: user?.role === "hr_officer",
    isAdminOrHR: user?.role === "admin" || user?.role === "hr_officer",
    isEmployee: user?.role === "employee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
