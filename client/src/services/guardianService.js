import api from './api';

const guardianService = {
    // Get all guardians
    getAllGuardians: async () => {
        try {
            const response = await api.get('/guardians');
            return response.data;
        } catch (error) {
            console.error('Error fetching guardians:', error);
            throw error;
        }
    },

    // Get a single guardian
    getGuardianById: async (id) => {
        try {
            const response = await api.get(`/guardians/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching guardian ${id}:`, error);
            throw error;
        }
    },

    // Create a guardian
    createGuardian: async (guardianData) => {
        try {
            const response = await api.post('/guardians', guardianData);
            return response.data;
        } catch (error) {
            console.error('Error creating guardian:', error);
            throw error;
        }
    },

    // Update a guardian
    updateGuardian: async (id, guardianData) => {
        try {
            const response = await api.put(`/guardians/${id}`, guardianData);
            return response.data;
        } catch (error) {
            console.error(`Error updating guardian ${id}:`, error);
            throw error;
        }
    },

    // Delete a guardian
    deleteGuardian: async (id) => {
        try {
            await api.delete(`/guardians/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting guardian ${id}:`, error);
            throw error;
        }
    },

    // Get all students for a guardian
    getGuardianStudents: async (guardianId) => {
        try {
            const response = await api.get(`/guardians/${guardianId}/students`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching students for guardian ${guardianId}:`, error);
            throw error;
        }
    }
};

export default guardianService; 