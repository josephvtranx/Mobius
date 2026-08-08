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

// Create an axios instance with default settings.
// D7: no cookies — the JWT (with its tenantCode claim) is the single
// credential, so no withCredentials.
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
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

// Handle token expiration: on a 401, try ONE silent refresh-and-retry
// using the stored refresh token before giving up and bouncing to /login.
// Without this, the 120-minute access-token TTL logs users out abruptly
// mid-work even though a valid refresh token is sitting in localStorage.
//
// A single shared refreshPromise coalesces concurrent 401s (a page firing
// several requests at once) into one refresh call. The refresh endpoint
// itself is exempted so a failed refresh doesn't recurse.
let refreshPromise = null;

function forceLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // guard against redirect loops if we're already on the login page
    if (!window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/login';
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const isRefreshCall = original?.url?.includes('/auth/refresh-token');

        if (status !== 401 || !original || original._retried || isRefreshCall) {
            if (status === 401 && isRefreshCall) forceLogout();
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            forceLogout();
            return Promise.reject(error);
        }

        original._retried = true;
        try {
            // Coalesce concurrent 401s into a single refresh request.
            refreshPromise = refreshPromise || api.post('/auth/refresh-token', { refreshToken })
                .then((res) => {
                    localStorage.setItem('token', res.data.accessToken);
                    if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
                    return res.data.accessToken;
                })
                .finally(() => { refreshPromise = null; });

            const newToken = await refreshPromise;
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        } catch (refreshErr) {
            forceLogout();
            return Promise.reject(refreshErr);
        }
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