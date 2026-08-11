// v2 sessions domain (server: /api/sessions — spec 04/06/07). The one-pass
// attendance+notes surface, and the cancellation flows.
import api from './api';

const sessionServiceV2 = {
    // Staff-only date-range query (max 62 days): sessions across all classes
    // in [from, to), optionally filtered to one student's active enrollments
    // or one instructor. Times must be UTC ISO-Z. Returns { from, to, sessions }.
    listRange: async ({ from, to, student_id, instructor_id }) => {
        try {
            const response = await api.get('/sessions', {
                params: {
                    from, to,
                    ...(student_id != null ? { student_id } : {}),
                    ...(instructor_id != null ? { instructor_id } : {}),
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error listing sessions:', error);
            throw error;
        }
    },

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

    // RSC-2: student/guardian cancel (the Window decides the money effect).
    // reason/note are optional — reason ∈ illness|transportation|
    // schedule_conflict|family_emergency|other (session_attendance.cancel_reason).
    cancelSession: async (sessionId, studentId, { reason, note } = {}) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/cancel`, {
                ...(studentId ? { student_id: studentId } : {}),
                ...(reason ? { reason } : {}),
                ...(note ? { note } : {}),
            });
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

    // ACA-4: instructor asks staff to unlock a locked session note so a
    // past-the-window correction can be made (files a note_unlock_request
    // staff task). 409 if a request is already pending for that note.
    requestNoteUnlock: async (sessionId, studentId, reason) => {
        try {
            const response = await api.post(
                `/sessions/${sessionId}/notes/${studentId}/unlock-request`,
                reason ? { reason } : {});
            return response.data;
        } catch (error) {
            console.error('Error requesting note unlock:', error);
            throw error;
        }
    },

    // RSC-3: instructor cancels their own session instance (unilateral;
    // families are made whole automatically — never deducts, auto-refunds any
    // prior deduction). Reason is required (free text).
    instructorCancel: async (sessionId, reason) => {
        try {
            const response = await api.post(`/sessions/${sessionId}/instructor-cancel`, { reason });
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
