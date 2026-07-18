// v2 guardian portal (server: /api/guardians/me/* — spec 05 GRD-1/GRD-5).
import api from './api';

const guardianPortalService = {
    getPortal: async () => {
        try {
            const response = await api.get('/guardians/me/portal');
            return response.data;
        } catch (error) {
            console.error('Error fetching portal:', error);
            throw error;
        }
    },

    // prefs.mode ∈ all | billing_only | digest (honored by the notification service)
    setPrefs: async (studentId, prefs) => {
        try {
            const response = await api.patch(`/guardians/me/students/${studentId}/prefs`, {
                notification_prefs: prefs
            });
            return response.data;
        } catch (error) {
            console.error('Error setting prefs:', error);
            throw error;
        }
    }
};

export default guardianPortalService;
