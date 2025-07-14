import api from './api';

const authService = {
    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Set the token in the default headers
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register user with all data in one request
    register: async (userData) => {
        try {
            // Ensure guardians array exists and has required fields
            if (userData.role === 'student' && userData.guardians) {
                userData.guardians = userData.guardians.map(guardian => ({
                    name: guardian.name || '',
                    phone: guardian.phone || '',
                    email: guardian.email || '',
                    relationship: guardian.relationship || ''
                }));
            }

            console.log('Registration request data:', userData);
            const response = await api.post('/auth/register', userData);

            // Registration successful - no need to store tokens since we redirect to login
            return response.data;
        } catch (error) {
            console.error('Registration error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                    headers: error.config?.headers
                },
                stack: error.stack
            });
            throw error;
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Remove the token from default headers
        delete api.defaults.headers.common['Authorization'];
    },

    // Get current user
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    // Set current user
    setCurrentUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get current user role
    getCurrentUserRole: () => {
        const user = authService.getCurrentUser();
        return user ? user.role : null;
    },

    // Refresh token
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token found');
            }

            const response = await api.post('/auth/refresh-token', { refreshToken });
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            }
            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            authService.logout();
            throw error;
        }
    },

    // Set institution code for multi-tenant context
    setInstitutionCode: async (code) => {
        try {
            const response = await api.post('/institution', { code });
            return response.data;
        } catch (error) {
            console.error('Institution code error:', error);
            throw error;
        }
    }
};

export default authService; 