import api from './api';

const classRosterService = {
    // Get class roster with optional filters
    getClassRoster: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.instructor_id) {
                params.append('instructor_id', filters.instructor_id);
            }
            if (filters.subject_id) {
                params.append('subject_id', filters.subject_id);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }
            
            const url = `/class-sessions/roster${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching class roster:', error);
            throw error;
        }
    },

    // Get class roster for a specific instructor
    getInstructorClassRoster: async (instructorId) => {
        try {
            const response = await api.get(`/class-sessions/roster?instructor_id=${instructorId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching instructor class roster:', error);
            throw error;
        }
    },

    // Get class roster for a specific subject
    getSubjectClassRoster: async (subjectId) => {
        try {
            const response = await api.get(`/class-sessions/roster?subject_id=${subjectId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subject class roster:', error);
            throw error;
        }
    },

    // Get class roster with specific status
    getClassRosterByStatus: async (status) => {
        try {
            const response = await api.get(`/class-sessions/roster?status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching class roster by status:', error);
            throw error;
        }
    }
};

export default classRosterService; 