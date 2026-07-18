// v2 self-serve booking (server: /api/bookings — SCH-4).
import api from './api';

const bookingService = {
    // instructor: own pending bookings; staff: all
    getPending: async () => {
        try {
            const response = await api.get('/bookings');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            throw error;
        }
    },

    // { instructor_id, subject_id, student_id?, starts_at, ends_at, tz }
    createBooking: async (payload) => {
        try {
            const response = await api.post('/bookings', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    respond: async (classId, { action, reason }) => {
        try {
            const response = await api.post(`/bookings/${classId}/respond`, { action, reason });
            return response.data;
        } catch (error) {
            console.error('Error responding to booking:', error);
            throw error;
        }
    }
};

export default bookingService;
