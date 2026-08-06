// Real payroll (server: /api/payroll).
import api from './api';

const payrollService = {
    getMine: async () => {
        try {
            const response = await api.get('/payroll/mine');
            return response.data;
        } catch (error) {
            console.error('Error fetching my payroll history:', error);
            throw error;
        }
    },

    preview: async (start, end) => {
        try {
            const response = await api.get('/payroll/preview', { params: { start, end } });
            return response.data;
        } catch (error) {
            console.error('Error previewing payroll:', error);
            throw error;
        }
    },

    run: async (payPeriodStart, payPeriodEnd) => {
        try {
            const response = await api.post('/payroll/run', {
                pay_period_start: payPeriodStart, pay_period_end: payPeriodEnd
            });
            return response.data;
        } catch (error) {
            console.error('Error running payroll:', error);
            throw error;
        }
    },

    getHistory: async () => {
        try {
            const response = await api.get('/payroll');
            return response.data;
        } catch (error) {
            console.error('Error fetching payroll history:', error);
            throw error;
        }
    }
};

export default payrollService;
