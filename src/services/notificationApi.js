import axios from '../utils/axios';

export const notificationApi = {
    getNotifications: async () => {
        try {
            const response = await axios.get('/notificaciones');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    markAsRead: async (notificationId) => {
        try {
            const response = await axios.put(`/notificaciones/${notificationId}/leer`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await axios.put('/notificaciones/leer-todas');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};