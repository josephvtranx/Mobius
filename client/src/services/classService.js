// v2 classes domain (server: /api/classes — spec 03/04). Template-first
// migration slice 1: these are the canonical class calls; the legacy
// classSeriesService/classSessionService remain only for the old pages.
import api from './api';

const classService = {
    // staff list with enrolled counts
    getAllClasses: async () => {
        try {
            const response = await api.get('/classes');
            return response.data;
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    },

    // detail: class + sessions + roster
    getClass: async (classId) => {
        try {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching class:', error);
            throw error;
        }
    },

    // family-facing group catalog (knob-gated server-side)
    getCatalog: async () => {
        try {
            const response = await api.get('/classes/catalog');
            return response.data;
        } catch (error) {
            console.error('Error fetching catalog:', error);
            throw error;
        }
    },

    // v2 create payload: { class_type, subject_id, instructor_id, student_limit,
    //   session_credit_cost, recurrence, recurrence_rule: { timezone, byday: [{day,start,end}] },
    //   starts_on, ends_on, default_room_id, sessions: [{starts_at, ends_at}] (one-offs) }
    createClass: async (payload) => {
        try {
            const response = await api.post('/classes', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    },

    enrollStudent: async (classId, studentId) => {
        try {
            const response = await api.post(`/classes/${classId}/enrollments`, { student_id: studentId });
            return response.data;
        } catch (error) {
            console.error('Error enrolling student:', error);
            throw error;
        }
    },

    endClass: async (classId, endsOn) => {
        try {
            const response = await api.patch(`/classes/${classId}/end`, { ends_on: endsOn });
            return response.data;
        } catch (error) {
            console.error('Error ending class:', error);
            throw error;
        }
    },

    terminateClass: async (classId) => {
        try {
            const response = await api.post(`/classes/${classId}/terminate`);
            return response.data;
        } catch (error) {
            console.error('Error terminating class:', error);
            throw error;
        }
    },

    // BIL-3: future-only price change (effectiveFrom = UTC ISO-Z)
    setPrice: async (classId, sessionCreditCost, effectiveFrom) => {
        try {
            const response = await api.post(`/classes/${classId}/price`, {
                session_credit_cost: sessionCreditCost,
                effective_from: effectiveFrom
            });
            return response.data;
        } catch (error) {
            console.error('Error setting price:', error);
            throw error;
        }
    },

    // SCH-5: future-only series schedule change
    updateSchedule: async (classId, { recurrence, recurrence_rule, effective_from }) => {
        try {
            const response = await api.patch(`/classes/${classId}/schedule`, {
                recurrence, recurrence_rule, effective_from
            });
            return response.data;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    }
};

export default classService;
