import axios from 'axios';

/**
 * API Configuration
 * 
 * In development (localhost): uses http://localhost:8081
 * In production (Docker): uses relative URL which nginx proxies to backend
 */

// Determine base URL based on environment
const getBaseURL = () => {
    // In production build, use relative URL (nginx will proxy /api to backend)
    if (import.meta.env.PROD) {
        return '/api';
    }
    // In development, use localhost directly
    return import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
export { getBaseURL };
