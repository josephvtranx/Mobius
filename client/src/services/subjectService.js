import api from './api';

const subjectService = {
    // Get all subject groups
    getAllSubjectGroups: async () => {
        try {
            const response = await api.get('/subject-groups');
            return response.data;
        } catch (error) {
            console.error('Error fetching subject groups:', error);
            throw error;
        }
    },

    // Get all subjects
    getAllSubjects: async () => {
        try {
            const response = await api.get('/subjects');
            return response.data;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    // Get a single subject
    getSubjectById: async (id) => {
        try {
            const response = await api.get(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching subject ${id}:`, error);
            throw error;
        }
    },

    // Create a subject
    createSubject: async (subjectData) => {
        try {
            const response = await api.post('/subjects', subjectData);
            return response.data;
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    },

    // Update a subject
    updateSubject: async (id, subjectData) => {
        try {
            const response = await api.put(`/subjects/${id}`, subjectData);
            return response.data;
        } catch (error) {
            console.error(`Error updating subject ${id}:`, error);
            throw error;
        }
    },

    // Delete a subject
    deleteSubject: async (id) => {
        try {
            await api.delete(`/subjects/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting subject ${id}:`, error);
            throw error;
        }
    }
};

export default subjectService; 