import api from './api';

const classSessionService = {
    // Get all class sessions
    getAllSessions: async () => {
        try {
            const response = await api.get('/classes');
            return response.data;
        } catch (error) {
            console.error('Error fetching class sessions:', error);
            throw error;
        }
    },

    // Get a single class session
    getSessionById: async (id) => {
        try {
            const response = await api.get(`/classes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching class session ${id}:`, error);
            throw error;
        }
    },

    // Create a class session
    createSession: async (sessionData) => {
        try {
            const response = await api.post('/classes', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error creating class session:', error);
            throw error;
        }
    },

    // Update a class session
    updateSession: async (id, sessionData) => {
        try {
            const response = await api.put(`/classes/${id}`, sessionData);
            return response.data;
        } catch (error) {
            console.error(`Error updating class session ${id}:`, error);
            throw error;
        }
    },

    // Delete a class session
    deleteSession: async (id) => {
        try {
            await api.delete(`/classes/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting class session ${id}:`, error);
            throw error;
        }
    },

    // Update class session status
    updateSessionStatus: async (id, status) => {
        try {
            const response = await api.patch(`/classes/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating class session status ${id}:`, error);
            throw error;
        }
    }
};

export default classSessionService; 