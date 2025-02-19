import api from './api';
import { getSocket } from './socket.service';

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
    },

    subscribe: (onNewNotification) => {
        const socket = getSocket();
        if (socket) {
            socket.on('nueva_notificacion', onNewNotification);
        }
        return () => {
            if (socket) {
                socket.off('nueva_notificacion');
            }
        };
    }
};

export default notificationService;