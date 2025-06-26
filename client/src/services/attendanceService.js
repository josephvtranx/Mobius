import api from './api.js';

const attendanceService = {
    // Mark attendance for a class session
    markAttendance: async (sessionId, studentId, attended, notes = null) => {
        try {
            const response = await api.post('/attendance/mark', {
                session_id: sessionId,
                student_id: studentId,
                attended,
                notes
            });
            return response.data;
        } catch (error) {
            console.error('Error marking attendance:', error);
            throw error;
        }
    },

    // Get attendance for a specific session
    getSessionAttendance: async (sessionId) => {
        try {
            const response = await api.get(`/attendance/session/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching session attendance:', error);
            throw error;
        }
    },

    // Get attendance history for a student
    getStudentAttendance: async (studentId, limit = 50, offset = 0) => {
        try {
            const response = await api.get(`/attendance/student/${studentId}?limit=${limit}&offset=${offset}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student attendance:', error);
            throw error;
        }
    },

    // Get attendance summary for a student
    getStudentAttendanceSummary: async (studentId) => {
        try {
            const response = await api.get(`/attendance/student/${studentId}/summary`);
            return response.data;
        } catch (error) {
            console.error('Error fetching attendance summary:', error);
            throw error;
        }
    }
};

export default attendanceService; 