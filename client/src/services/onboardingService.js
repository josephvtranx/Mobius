// Add-student wizard support calls (SPEC-add-student-wizard.md). The wizard
// composes existing primitives (createClass, enrollStudent, recordPayment
// from their own services); these are the calls new with the wizard.
import api from './api';

const onboardingService = {
    // Staff-created student (step 1). Guardian linking is the separate GRD-2
    // call below so the guardian model has one implementation.
    createStudent: async (payload) => {
        try {
            const response = await api.post('/students', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    linkGuardian: async (studentId, guardian) => {
        try {
            const response = await api.post(`/students/${studentId}/guardians`, guardian);
            return response.data;
        } catch (error) {
            console.error('Error linking guardian:', error);
            throw error;
        }
    },

    // Smart Match (step 3): real open slots intersected with the painted
    // availability. availability: [{ day, start, end }] wall-clock in tz.
    match: async ({ subject_id, per_week, availability, tz }) => {
        try {
            const response = await api.post('/instructors/match', { subject_id, per_week, availability, tz });
            return response.data;
        } catch (error) {
            console.error('Error matching instructors:', error);
            throw error;
        }
    },

    getSettings: async () => {
        try {
            const response = await api.get('/settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    },
};

export default onboardingService;
