import api from './api';
import { toUtcIso, isoToLocal } from '../lib/time.js';

const classSessionService = {
    // Get all class sessions
    getAllSessions: async () => {
        try {
            const response = await api.get('/class-sessions');
            return response.data;
        } catch (error) {
            console.error('Error fetching class sessions:', error);
            throw error;
        }
    },

    // Get a single class session
    getSessionById: async (id) => {
        try {
            const response = await api.get(`/class-sessions/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching class session ${id}:`, error);
            throw error;
        }
    },

    // Create a class session with TIMESTAMPTZ fields
    createSession: async (sessionData) => {
        try {
            // Ensure session_start and session_end are in UTC ISO format
            const session = {
                ...sessionData,
                session_start: toUtcIso(sessionData.session_start),
                session_end: toUtcIso(sessionData.session_end)
            };
            
            console.log('Creating session with TIMESTAMPTZ data:', session);
            const response = await api.post('/class-sessions', session);
            return response.data;
        } catch (error) {
            console.error('Error creating class session:', error);
            throw error;
        }
    },

    // Update a class session
    updateSession: async (id, sessionData) => {
        try {
            // Ensure session_start and session_end are in UTC ISO format if provided
            const session = { ...sessionData };
            if (session.session_start) {
                session.session_start = toUtcIso(session.session_start);
            }
            if (session.session_end) {
                session.session_end = toUtcIso(session.session_end);
            }
            
            const response = await api.put(`/class-sessions/${id}`, session);
            return response.data;
        } catch (error) {
            console.error(`Error updating class session ${id}:`, error);
            throw error;
        }
    },

    // Delete a class session
    deleteSession: async (id) => {
        try {
            await api.delete(`/class-sessions/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting class session ${id}:`, error);
            throw error;
        }
    },

    // Update class session status
    updateSessionStatus: async (id, status) => {
        try {
            const response = await api.patch(`/class-sessions/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating class session status ${id}:`, error);
            throw error;
        }
    },

    // Get sessions for a specific instructor
    getInstructorSessions: async (instructorId, startDate = null, endDate = null) => {
        try {
            let url = `/class-sessions/instructor/${instructorId}`;
            const params = new URLSearchParams();
            
            if (startDate) {
                params.append('startDate', toUtcIso(startDate));
            }
            if (endDate) {
                params.append('endDate', toUtcIso(endDate));
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sessions for instructor ${instructorId}:`, error);
            throw error;
        }
    },

    // Get sessions for a specific student
    getStudentSessions: async (studentId, startDate = null, endDate = null) => {
        try {
            let url = `/class-sessions?student_id=${studentId}`;
            const params = new URLSearchParams();
            
            if (startDate) {
                params.append('start_date', toUtcIso(startDate));
            }
            if (endDate) {
                params.append('end_date', toUtcIso(endDate));
            }
            
            if (params.toString()) {
                url += `&${params.toString()}`;
            }
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sessions for student ${studentId}:`, error);
            throw error;
        }
    }
};

export default classSessionService; 