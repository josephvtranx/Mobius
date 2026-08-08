// In-app notifications (server: /api/notifications).
import api from './api';

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data; // { notifications, unread }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/count');
            return response.data.unread;
        } catch (error) {
            console.error('Error fetching notification count:', error);
            throw error;
        }
    },

    markRead: async (ids) => {
        try {
            await api.post('/notifications/read', ids ? { ids } : {});
            return true;
        } catch (error) {
            console.error('Error marking notifications read:', error);
            throw error;
        }
    }
};

export default notificationService;
