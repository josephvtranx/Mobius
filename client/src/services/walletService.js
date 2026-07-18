// v2 wallet domain (server: /api/wallets — spec 04). Balance/committed/
// available are per-student (never pooled); manual entries are the staff
// top-up stopgap until the Top-Up spec lands.
import api from './api';

const walletService = {
    getWallet: async (studentId) => {
        try {
            const response = await api.get(`/wallets/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching wallet:', error);
            throw error;
        }
    },

    // entry_type ∈ purchase | bonus | adjustment (deduction/refund are
    // attendance-driven only — INV-1; cashout waits for the Top-Up spec)
    addEntry: async (studentId, { entry_type, amount, note }) => {
        try {
            const response = await api.post(`/wallets/${studentId}/entries`, {
                entry_type, amount, note
            });
            return response.data;
        } catch (error) {
            console.error('Error adding wallet entry:', error);
            throw error;
        }
    }
};

export default walletService;
