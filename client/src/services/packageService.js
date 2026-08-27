// Credit packages (server: /api/packages) — academy-defined credit bundles.
// Purchasing goes through paymentService.recordPayment({ package_id }) so
// money and credits move in one server transaction.
import api from './api';

const packageService = {
    getPackages: async (includeRetired = false) => {
        try {
            const response = await api.get('/packages', { params: includeRetired ? { all: 1 } : {} });
            return response.data;
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw error;
        }
    },

    createPackage: async (payload) => {
        try {
            const response = await api.post('/packages', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    },

    updatePackage: async (packageId, payload) => {
        try {
            const response = await api.patch(`/packages/${packageId}`, payload);
            return response.data;
        } catch (error) {
            console.error('Error updating package:', error);
            throw error;
        }
    },
};

export default packageService;
