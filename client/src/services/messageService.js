// Real messaging (server: /api/messages).
import api from './api';

const messageService = {
    getContacts: async () => {
        try {
            const response = await api.get('/messages/contacts');
            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    },

    getConversations: async () => {
        try {
            const response = await api.get('/messages/conversations');
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    },

    startConversation: async (recipientUserId) => {
        try {
            const response = await api.post('/messages/conversations', { recipient_user_id: recipientUserId });
            return response.data;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw error;
        }
    },

    getMessages: async (conversationId) => {
        try {
            const response = await api.get(`/messages/conversations/${conversationId}/messages`);
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    sendMessage: async (conversationId, body) => {
        try {
            const response = await api.post(`/messages/conversations/${conversationId}/messages`, { body });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};

export default messageService;
