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
        setUser(JSON.parse(storedUser));
        try {
          // Validate token by fetching profile
          const profile = await authAPI.getProfile();
          const normalized = normalizeUser(profile);
          setUser(normalized);
          localStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(normalized)
          );
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
      let profile = null;
      try {
        profile = await authAPI.getProfile();
      } catch (profileError) {
        console.warn(
          "Profile fetch after login failed, using login payload:",
          profileError
        );
      }

      const userData = normalizeUser(profile || response.user || response);
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
    isAdmin: user?.role === "ADMIN",
    isHR: user?.role === "HR",
    isAdminOrHR: user?.role === "ADMIN" || user?.role === "HR",
    isEmployee: user?.role === "EMPLOYEE",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const normalizeUser = (raw) => {
  if (!raw) return null;

  const user = raw.user || raw;
  return {
    id: user.id,
    email: user.email,
    employee_id: user.employee_id,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name:
      user.full_name ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    phone: user.phone,
    department: user.department,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
