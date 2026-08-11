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

    // (createInstructor/deleteInstructor removed 2026-08-08: the POST /
    // route was deleted server-side — legacy v1 columns, zero callers —
    // and DELETE /instructors/:id never existed as a server route at all.)

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

    // (getInstructorSchedule removed 2026-08-08: its GET /:id/schedule
    // server route was deleted earlier — it queried v1-only columns — and
    // no page called this method. Real schedule reads use
    // instructorCalendarService.)

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
    },

    // Add a time-off block: { start_datetime, end_datetime, reason? } (UTC ISO-Z)
    addUnavailability: async (id, block) => {
        try {
            const response = await api.post(`/instructors/${id}/unavailability`, block);
            return response.data;
        } catch (error) {
            console.error(`Error adding unavailability for instructor ${id}:`, error);
            throw error;
        }
    },

    deleteUnavailability: async (id, unavailabilityId) => {
        try {
            await api.delete(`/instructors/${id}/unavailability/${unavailabilityId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting unavailability ${unavailabilityId}:`, error);
            throw error;
        }
    }
};

export default instructorService; 