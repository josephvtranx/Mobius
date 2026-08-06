// Room directory (server: /api/rooms).
import api from './api';

const roomService = {
    getAllRooms: async () => {
        try {
            const response = await api.get('/rooms');
            return response.data;
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    createRoom: async ({ name, capacity, notes }) => {
        try {
            const response = await api.post('/rooms', { name, capacity, notes });
            return response.data;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }
};

export default roomService;
