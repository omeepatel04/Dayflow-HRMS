import axios from 'axios';

// The URL where Het's Django server is running
const API_URL = 'http://localhost:8000/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR 1: The "Auto-Login" ---
// Before every request, check if we have a token saved in LocalStorage.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Offline persistence
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR 2: The "Session Expired" Handler ---
// If the backend says "401 Unauthorized" (token expired), log the user out locally.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // OPTIONAL: You could try to refresh the token here if Het built a refresh endpoint.
            // For now, we will just force logout to keep it simple.
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;