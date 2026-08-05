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

    // RSC-1: 1:1 reschedule request (times as UTC ISO-Z; the server holds the
    // slot and flips the original to reschedule_requested)
    requestReschedule: async (sessionId, { proposed_starts_at, proposed_ends_at }) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/reschedule-request`, {
                proposed_starts_at, proposed_ends_at
            });
            return response.data;
        } catch (error) {
            console.error('Error requesting reschedule:', error);
            throw error;
        }
    },

    // ACA-1/INV-5: write or touch-up a session note outside the one-pass
    // attendance save (e.g. adding feedback after the fact)
    putNote: async (sessionId, studentId, fields) => {
        try {
            const response = await api.put(`/sessions/${sessionId}/notes/${studentId}`, fields);
            return response.data;
        } catch (error) {
            console.error('Error saving session note:', error);
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
