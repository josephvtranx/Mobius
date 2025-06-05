import api from './api';

const authService = {
    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register based on role
    register: async (userData, role) => {
        try {
            // First create the base user
            const requestData = {
                ...userData,
                role: role
            };
            console.log('Registration request data:', requestData);

            const userResponse = await api.post('/auth/register', requestData);

            if (userResponse.data.token) {
                localStorage.setItem('token', userResponse.data.token);
                localStorage.setItem('user', JSON.stringify(userResponse.data.user));
            }

            return userResponse.data;
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

    // Complete role-specific registration
    completeRoleRegistration: async (roleData, role) => {
        try {
            let endpoint = '';
            let response;

            switch (role) {
                case 'student':
                    // Create the student record with all details
                    const studentData = {
                        ...roleData,
                        status: roleData.status || 'enrolled'
                    };
                    const guardianInfo = studentData.guardian;
                    delete studentData.guardian; // Remove guardian info as it goes in separate table

                    // Create student profile
                    response = await api.post('/students', studentData);
                    const student_id = response.data.student_id;

                    // Then create the guardian
                    const guardianResponse = await api.post('/guardians', {
                        name: guardianInfo.name,
                        phone: guardianInfo.phone,
                        email: guardianInfo.email,
                        relationship: guardianInfo.relationship
                    });
                    const guardian_id = guardianResponse.data.guardian_id;

                    // Finally create the student-guardian relationship
                    await api.post('/student-guardian', {
                        student_id,
                        guardian_id
                    });
                    break;

                case 'instructor':
                    endpoint = '/instructors';
                    response = await api.post(endpoint, roleData);
                    break;

                case 'staff':
                    endpoint = '/staff';
                    response = await api.post(endpoint, roleData);
                    break;

                default:
                    throw new Error('Invalid role');
            }

            return response.data;
        } catch (error) {
            console.error('Role registration error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw error;
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get current user role
    getCurrentUserRole: () => {
        const user = authService.getCurrentUser();
        return user ? user.role : null;
    }
};

export default authService; 