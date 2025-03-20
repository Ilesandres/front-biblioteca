import api from './api';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notificaciones');
        return response.data.data;
    },

    markNotificationAsRead: async (notificationId) => {
        const response = await api.put(`/notificaciones/${notificationId}/leer`);
        return response.data;
    },

    clearAllNotifications: async () => {
        const response = await api.put('/notificaciones/leer-todas');
        return response.data;
    }
};

export default notificationService;