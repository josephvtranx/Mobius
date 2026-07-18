// v2 open-calendar read (server: GET /api/instructors/:id/open-slots).
// Availability − sessions − active holds, projected in the academy wall-clock
// zone `tz`. Consumed by the booking/reschedule surfaces (slice 3).
import api from './api';

const instructorCalendarService = {
    // the caller's own upcoming teaching sessions (home dashboard)
    getMySessions: async (days = 7) => {
        try {
            const response = await api.get('/instructors/me/sessions', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching my sessions:', error);
            throw error;
        }
    },

    getOpenSlots: async (instructorId, fromIso, toIso, tz) => {
        try {
            const response = await api.get(`/instructors/${instructorId}/open-slots`, {
                params: { from: fromIso, to: toIso, tz }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching open slots:', error);
            throw error;
        }
    }
};

export default instructorCalendarService;
