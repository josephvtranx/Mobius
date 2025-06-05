import api from './api';

const studentGuardianService = {
    // Get all student-guardian relationships
    getAllRelationships: async () => {
        try {
            const response = await api.get('/student-guardian');
            return response.data;
        } catch (error) {
            console.error('Error fetching relationships:', error);
            throw error;
        }
    },

    // Link a student to a guardian
    createRelationship: async (studentId, guardianId) => {
        try {
            const response = await api.post('/student-guardian', {
                student_id: studentId,
                guardian_id: guardianId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating relationship:', error);
            throw error;
        }
    },

    // Remove a student-guardian relationship
    deleteRelationship: async (studentId, guardianId) => {
        try {
            await api.delete('/student-guardian', {
                data: {
                    student_id: studentId,
                    guardian_id: guardianId
                }
            });
            return true;
        } catch (error) {
            console.error('Error deleting relationship:', error);
            throw error;
        }
    },

    // Get all guardians for a student
    getStudentGuardians: async (studentId) => {
        try {
            const response = await api.get(`/student-guardian/student/${studentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching guardians for student ${studentId}:`, error);
            throw error;
        }
    },

    // Get all students for a guardian
    getGuardianStudents: async (guardianId) => {
        try {
            const response = await api.get(`/student-guardian/guardian/${guardianId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching students for guardian ${guardianId}:`, error);
            throw error;
        }
    }
};

export default studentGuardianService; 