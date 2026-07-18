// v2 per-student family reads (server: /api/students/:id/schedule|record).
// Authz server-side: staff, the student, or a linked guardian.
import api from './api';

const studentViewService = {
    getSchedule: async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/schedule`);
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    },

    getRecord: async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/record`);
            return response.data;
        } catch (error) {
            console.error('Error fetching record:', error);
            throw error;
        }
    }
};

export default studentViewService;
