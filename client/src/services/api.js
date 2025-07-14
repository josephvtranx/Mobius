// This is our base API setup
import axios from 'axios';

// Use Vite's proxy configuration
const API_URL = import.meta.env.DEV ? 'http://localhost:5001/api' : '/api';

// Create an axios instance with default settings
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
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

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/register', userData),
    verify: () => api.get('/auth/verify'),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// User endpoints
export const user = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getAllUsers: () => api.get('/users/all') // Admin only
};

export default api; 