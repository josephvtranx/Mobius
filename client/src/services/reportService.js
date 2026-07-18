// v2 staff reports (server: /api/reports — spec 06 ACA-3 + spec 08 signals).
import api from './api';

const reportService = {
    getDashboard: async () => {
        try {
            const response = await api.get('/reports/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    },

    getNoteCompletion: async (days = 30) => {
        try {
            const response = await api.get('/reports/note-completion', { params: { days } });
            return response.data;
        } catch (error) {
            console.error('Error fetching note completion:', error);
            throw error;
        }
    }
};

export default reportService;
