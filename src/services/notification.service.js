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
    },

    // Configuración de eventos WebSocket
    setupWebSocket: (socket, handlers) => {
        if (!socket) return;

        // Escuchar nuevas notificaciones
        socket.on('nueva_notificacion', handlers.onNewNotification);

        // Escuchar actualizaciones de notificaciones
        socket.on('notification_update', handlers.onNotificationUpdate);

        // Escuchar cuando se limpian todas las notificaciones
        socket.on('notifications_cleared', handlers.onNotificationsCleared);

        // Retornar función de limpieza
        return () => {
            socket.off('nueva_notificacion');
            socket.off('notification_update');
            socket.off('notifications_cleared');
        };
    },

    // Emitir eventos al servidor
    emitNotificationRead: (socket, notificationId) => {
        if (socket) {
            socket.emit('mark_notification_read', notificationId);
        }
    },

    emitClearAllNotifications: (socket) => {
        if (socket) {
            socket.emit('clear_all_notifications');
        }
    }
};

export default notificationService;