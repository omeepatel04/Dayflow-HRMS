import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'hr_officer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
