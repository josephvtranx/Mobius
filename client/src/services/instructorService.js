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
    },

    // Get instructor roster (specific endpoint for roster view)
    getInstructorRoster: async () => {
        try {
            const response = await api.get('/instructors/roster');
            return response.data;
        } catch (error) {
            console.error('Error fetching instructor roster:', error);
            throw error;
        }
    },

    // Get instructor schedule for a week
    getInstructorSchedule: async (id, startDate, endDate) => {
        try {
            let url = `/instructors/${id}/schedule`;
            const params = [];
            if (startDate) params.push(`start_date=${startDate}`);
            if (endDate) params.push(`end_date=${endDate}`);
            if (params.length) url += `?${params.join('&')}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching instructor ${id} schedule:`, error);
            throw error;
        }
    },

    // Get instructor availability
    getInstructorAvailability: async (id) => {
        try {
            const response = await api.get(`/instructors/${id}/availability`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching instructor ${id} availability:`, error);
            throw error;
        }
    }
};

export default instructorService; 