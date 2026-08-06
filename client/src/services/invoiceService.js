// Real invoices (server: /api/invoices).
import api from './api';

const invoiceService = {
    createInvoice: async (data) => {
        try {
            const response = await api.post('/invoices', data);
            return response.data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    getInvoices: async ({ status } = {}) => {
        try {
            const response = await api.get('/invoices', { params: { status } });
            return response.data;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    },

    getStudentInvoices: async (studentId) => {
        try {
            const response = await api.get(`/invoices/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student invoices:', error);
            throw error;
        }
    },

    payInvoice: async (invoiceId, data) => {
        try {
            const response = await api.post(`/invoices/${invoiceId}/pay`, data);
            return response.data;
        } catch (error) {
            console.error('Error recording invoice payment:', error);
            throw error;
        }
    },

    cancelInvoice: async (invoiceId) => {
        try {
            const response = await api.patch(`/invoices/${invoiceId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            throw error;
        }
    }
};

export default invoiceService;
