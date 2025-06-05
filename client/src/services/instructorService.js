import api from './api';

const instructorService = {
    // Get all instructors
    getAllInstructors: async () => {
        try {
            const response = await api.get('/instructors');
            return response.data;
        } catch (error) {
            console.error('Error fetching instructors:', error);
            throw error;
        }
    },

    // Get a single instructor
    getInstructorById: async (id) => {
        try {
            const response = await api.get(`/instructors/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching instructor ${id}:`, error);
            throw error;
        }
    },

    // Create an instructor
    createInstructor: async (instructorData) => {
        try {
            const response = await api.post('/instructors', instructorData);
            return response.data;
        } catch (error) {
            console.error('Error creating instructor:', error);
            throw error;
        }
    },

    // Update an instructor
    updateInstructor: async (id, instructorData) => {
        try {
            const response = await api.put(`/instructors/${id}`, instructorData);
            return response.data;
        } catch (error) {
            console.error(`Error updating instructor ${id}:`, error);
            throw error;
        }
    },

    // Delete an instructor
    deleteInstructor: async (id) => {
        try {
            await api.delete(`/instructors/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting instructor ${id}:`, error);
            throw error;
        }
    }
};

export default instructorService; 