import api from './api';
import { getSocket } from './socket.service';

const notificationService = {
    getAll: async () => {
        const response = await api.get('/notificaciones');
        return response.data;
    },

    markAsRead: async (notificationId) => {
        const response = await api.put(`/notificaciones/${notificationId}/leer`);
        return response.data;
    },

    markAllAsRead: async () => {
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