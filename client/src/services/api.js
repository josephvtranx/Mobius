// This is our base API setup
import axios from 'axios';

// Use Vite's environment variable for API URL, with smart fallbacks
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we should use proxy in development
  const useProxy = import.meta.env.VITE_USE_PROXY !== 'false';
  
  // In development, use proxy unless explicitly disabled
  if (import.meta.env.DEV && useProxy) {
    return '/api';
  }
  
  // In production, use the remote server
  return 'https://mobius-t071.onrender.com/api';
};

const API_URL = getApiUrl();

// Create an axios instance with default settings
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true, // <-- ensure cookies are sent for session
    timeout: 10000 // 10 second timeout
});

// Add debugging for API calls
console.log('API Configuration:', {
    baseURL: API_URL,
    environment: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    useProxy: import.meta.env.VITE_USE_PROXY,
    viteApiUrl: import.meta.env.VITE_API_URL
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