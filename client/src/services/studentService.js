import api from './api';

// Slimmed 2026-08-08: getStudentById/createStudent/updateStudent/
// deleteStudent and the time-package/time-balance methods called legacy v1
// endpoints that were removed server-side (they referenced dropped v1
// tables and had zero page callers). Student creation happens through
// registration (authService); per-student reads live in
// studentViewService/guardianPortalService (v2 surfaces).
const studentService = {
    // Get all students (staff-only endpoint)
    getAllStudents: async () => {
        try {
            const response = await api.get('/students');
            return response.data;
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    getRoster: async () => {
        try {
            const response = await api.get('/students/roster'); // baseURL already includes /api
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default studentService;
