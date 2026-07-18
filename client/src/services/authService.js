import api from './api';

const authService = {
    // Login user. D7: the institution code travels in the X-Institution-Code
    // header on this pre-auth request; after login the JWT carries the tenant.
    login: async (credentials) => {
        try {
            const institutionCode =
                credentials.institutionCode || localStorage.getItem('institutionCode');
            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password
            }, {
                headers: { 'X-Institution-Code': institutionCode }
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
            // v2 guardian shape: guardians become logins keyed by email
            // (email/name/relationship required server-side; phone optional —
            // never default email to '' or the server validation gets confusing)
            if (userData.role === 'student' && userData.guardians) {
                userData.guardians = userData.guardians.map(guardian => ({
                    name: guardian.name,
                    email: guardian.email,
                    phone: guardian.phone || undefined,
                    relationship: guardian.relationship
                }));
            }

            console.log('Registration request data:', userData);
            // D7: registration is tenant-scoped via the header (no cookie)
            const response = await api.post('/auth/register', userData, {
                headers: { 'X-Institution-Code': localStorage.getItem('institutionCode') }
            });

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
        localStorage.removeItem('institutionCode');
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

    // Validate the institution code (D7: stateless — the server keeps no
    // session; the code is persisted locally and sent as a header on
    // login/register, then travels inside the JWT)
    setInstitutionCode: async (code) => {
        try {
            console.log('Validating institution code:', code);
            const response = await api.post('/institution', { code });
            localStorage.setItem('institutionCode', code);
            return response.data;
        } catch (error) {
            console.error('Institution code error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    }
};

export default authService; 