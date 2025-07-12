import api from './api';

const classSeriesService = {
    // Get all class series
    getAllClassSeries: async () => {
        try {
            const response = await api.get('/class-series');
            return response.data;
        } catch (error) {
            console.error('Error fetching class series:', error);
            throw error;
        }
    },

    // Get pending class series
    getPendingClassSeries: async () => {
        try {
            const response = await api.get('/class-series/pending');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending class series:', error);
            throw error;
        }
    },

    // Create a new class series
    createClassSeries: async (classSeriesData) => {
        try {
            const response = await api.post('/class-series', classSeriesData);
            return response.data;
        } catch (error) {
            console.error('Error creating class series:', error);
            throw error;
        }
    },

    // Create a one-time class session
    createOneTimeClass: async (classData) => {
        try {
            console.log('Sending class data:', classData);
            const response = await api.post('/class-sessions', classData);
            return response.data;
        } catch (error) {
            console.error('Error creating one-time class:', error);
            console.error('Request data:', classData);
            console.error('Response data:', error.response?.data);
            throw error;
        }
    },

    // Update class series status
    updateClassSeriesStatus: async (seriesId, status) => {
        try {
            const response = await api.patch(`/class-series/${seriesId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating class series status:', error);
            throw error;
        }
    },

    // Delete class series
    deleteClassSeries: async (seriesId) => {
        try {
            await api.delete(`/class-series/${seriesId}`);
            return true;
        } catch (error) {
            console.error('Error deleting class series:', error);
            throw error;
        }
    }
};

export default classSeriesService; 