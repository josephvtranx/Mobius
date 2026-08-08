// Staff task inbox (server: /api/staff-tasks).
import api from './api';

const staffTaskService = {
    getTasks: async (status) => {
        try {
            const response = await api.get('/staff-tasks', { params: { status } });
            return response.data; // { tasks, open_count }
        } catch (error) {
            console.error('Error fetching staff tasks:', error);
            throw error;
        }
    },

    getOpenCount: async () => {
        try {
            const response = await api.get('/staff-tasks/count');
            return response.data.open_count;
        } catch (error) {
            console.error('Error fetching task count:', error);
            throw error;
        }
    },

    resolveTask: async (taskId, action) => {
        try {
            const response = await api.post(`/staff-tasks/${taskId}/resolve`, { action });
            return response.data;
        } catch (error) {
            console.error('Error resolving task:', error);
            throw error;
        }
    }
};

export default staffTaskService;
