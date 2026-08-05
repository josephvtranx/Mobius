import api from './api';
import classService from './classService';

const instructorService = {
    // Derived "my classes" list: there's no dedicated endpoint for this, so
    // it's built from GET /instructors/:id's `upcoming_sessions` (despite
    // the name, this is every session ever scheduled for them, unfiltered
    // by time) to discover distinct class_ids, then one getClass per class
    // for the real subject/roster/session details. N+1 by class count, but
    // instructors teach a small number of classes.
    getMyClasses: async (id) => {
        const instructor = await instructorService.getInstructorById(id);
        const classIds = [...new Set(
            (instructor.upcoming_sessions || [])
                .filter((s) => s && s.class_id)
                .map((s) => s.class_id)
        )];
        return Promise.all(classIds.map((cid) => classService.getClass(cid)));
    },

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
    },

    // Add a weekly availability window: { day_of_week, start_time, end_time, type?, status?, start_date?, end_date?, notes? }
    addAvailability: async (id, window) => {
        try {
            const response = await api.post(`/instructors/${id}/availability`, window);
            return response.data;
        } catch (error) {
            console.error(`Error adding availability for instructor ${id}:`, error);
            throw error;
        }
    },

    updateAvailability: async (id, availabilityId, window) => {
        try {
            const response = await api.put(`/instructors/${id}/availability/${availabilityId}`, window);
            return response.data;
        } catch (error) {
            console.error(`Error updating availability ${availabilityId}:`, error);
            throw error;
        }
    },

    deleteAvailability: async (id, availabilityId) => {
        try {
            await api.delete(`/instructors/${id}/availability/${availabilityId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting availability ${availabilityId}:`, error);
            throw error;
        }
    },

    getUnavailability: async (id) => {
        try {
            const response = await api.get(`/instructors/${id}/unavailability`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching unavailability for instructor ${id}:`, error);
            throw error;
        }
    }
};

export default instructorService; 