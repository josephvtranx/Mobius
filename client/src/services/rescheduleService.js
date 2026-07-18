// v2 reschedule-request inbox + responses (server: /api/reschedule-requests).
import api from './api';

const rescheduleService = {
    // instructor: own sessions' requests; staff: all
    getRequests: async (status) => {
        try {
            const response = await api.get('/reschedule-requests', {
                params: status ? { status } : {}
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching reschedule requests:', error);
            throw error;
        }
    },

    respond: async (requestId, { action, reason }) => {
        try {
            const response = await api.post(`/reschedule-requests/${requestId}/respond`, { action, reason });
            return response.data;
        } catch (error) {
            console.error('Error responding to reschedule request:', error);
            throw error;
        }
    }
};

export default rescheduleService;
