// Real payments (server: /api/payments).
import api from './api';

const paymentService = {
    getMethods: async () => {
        try {
            const response = await api.get('/payments/methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    },

    addMethod: async (data) => {
        try {
            const response = await api.post('/payments/methods', data);
            return response.data;
        } catch (error) {
            console.error('Error adding payment method:', error);
            throw error;
        }
    },

    recordPayment: async (data) => {
        try {
            const response = await api.post('/payments', data);
            return response.data;
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    getPayments: async ({ start, end } = {}) => {
        try {
            const response = await api.get('/payments', { params: { start, end } });
            return response.data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    },

    getStudentPayments: async (studentId) => {
        try {
            const response = await api.get(`/payments/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student payment history:', error);
            throw error;
        }
    }
};

export default paymentService;
