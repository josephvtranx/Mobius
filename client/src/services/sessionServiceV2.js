// v2 sessions domain (server: /api/sessions — spec 04/06/07). The one-pass
// attendance+notes surface, and the cancellation flows.
import api from './api';

const sessionServiceV2 = {
    // marks: [{ student_id, status, note?: {performance, improvements, free_notes} }]
    // status ∈ present | absent_unexcused | absent_excused |
    //          cancelled_in_window | cancelled_late | instructor_cancelled
    markAttendance: async (sessionId, marks) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/attendance`, { marks });
            return response.data;
        } catch (error) {
            console.error('Error marking attendance:', error);
            throw error;
        }
    },

    // RSC-2: student/guardian cancel (the Window decides the money effect)
    cancelSession: async (sessionId, studentId) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/cancel`,
                studentId ? { student_id: studentId } : {});
            return response.data;
        } catch (error) {
            console.error('Error cancelling session:', error);
            throw error;
        }
    },

    // RSC-5: staff cancel — unbound by the Window; status defaults to the
    // never-deduct instructor_cancelled equivalent server-side
    staffCancel: async (sessionId, { status, reason } = {}) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/staff-cancel`, { status, reason });
            return response.data;
        } catch (error) {
            console.error('Error staff-cancelling session:', error);
            throw error;
        }
    }
};

export default sessionServiceV2;
