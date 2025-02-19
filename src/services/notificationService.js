import { socketService } from './socket';

class NotificationService {
    constructor() {
        this.notificationHandlers = new Set();
        this.initialize();
    }

    initialize() {
        if (!socketService.socket) {
            socketService.connect();
        }

        socketService.socket?.on('nueva_notificacion', (notification) => {
            this.notificationHandlers.forEach(handler => handler(notification));
        });

        socketService.socket?.on('notificacion_admin', (notification) => {
            this.notificationHandlers.forEach(handler => handler(notification));
        });
    }

    onNotification(handler) {
        this.notificationHandlers.add(handler);
    }

    removeNotificationHandler(handler) {
        this.notificationHandlers.delete(handler);
    }

    disconnect() {
        this.notificationHandlers.clear();
    }
}

export const notificationService = new NotificationService();