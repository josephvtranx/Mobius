import api from './api';

const studentService = {
    // Get all students
    getAllStudents: async () => {
        try {
            const response = await api.get('/students');
            return response.data;
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error;
        }
    },

    // Get a single student
    getStudentById: async (id) => {
        try {
            const response = await api.get(`/students/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching student ${id}:`, error);
            throw error;
        }
    },

    // Create a student
    createStudent: async (studentData) => {
        try {
            const response = await api.post('/students', studentData);
            return response.data;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    // Update a student
    updateStudent: async (id, studentData) => {
        try {
            const response = await api.put(`/students/${id}`, studentData);
            return response.data;
        } catch (error) {
            console.error(`Error updating student ${id}:`, error);
            throw error;
        }
    },

    // Delete a student
    deleteStudent: async (id) => {
        try {
            await api.delete(`/students/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting student ${id}:`, error);
            throw error;
        }
    }
};

export default studentService; 