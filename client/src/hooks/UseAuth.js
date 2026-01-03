import { useState } from 'react';
import api from '../services/api';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Login Action
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Send credentials to Django
            const response = await api.post('/auth/login/', { email, password });
            // 2. Save data for "Offline" persistence
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };
    // Logout Action
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
    };
    return { login, logout, loading, error };
};