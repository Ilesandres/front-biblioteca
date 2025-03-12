import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { disconnectSocket, initializeSocket } from '../services/socket.service';
import notificationService from '../services/notification.service';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, token }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Inicializar socket
    useEffect(() => {
        if (token) {
            console.log('Inicializando socket con token');
            const newSocket = initializeSocket(token);
            setSocket(newSocket);
        }
        return () => {
            disconnectSocket();
        };
    }, [token]);

    // Cargar notificaciones iniciales y configurar listeners
    useEffect(() => {
        if (socket) {
            const loadNotifications = async () => {
                try {
                    const data = await notificationService.getNotifications();
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.read).length);
                } catch (error) {
                    console.error('Error al cargar notificaciones:', error);
                }
            };

            // Cargar notificaciones iniciales
            loadNotifications();

            // Escuchar notificaciones pendientes
            socket.on('notificaciones_pendientes', (pendingNotifications) => {
                console.log('Notificaciones pendientes recibidas:', pendingNotifications);
                setNotifications(pendingNotifications);
                setUnreadCount(pendingNotifications.filter(n => !n.read).length);
            });

            // Escuchar nuevas notificaciones
            socket.on('nueva_notificacion', (notification) => {
                console.log('Nueva notificación recibida:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // Escuchar actualizaciones de notificaciones
            socket.on('notification_update', (updatedNotification) => {
                console.log('Actualización de notificación:', updatedNotification);
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === updatedNotification.id 
                            ? { ...notif, read: updatedNotification.read }
                            : notif
                    )
                );
                if (updatedNotification.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            });

            // Escuchar limpieza de notificaciones
            socket.on('notifications_cleared', () => {
                console.log('Todas las notificaciones marcadas como leídas');
                setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
                setUnreadCount(0);
            });

            return () => {
                socket.off('notificaciones_pendientes');
                socket.off('nueva_notificacion');
                socket.off('notification_update');
                socket.off('notifications_cleared');
            };
        }
    }, [socket]);

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markNotificationAsRead(notificationId);
            socket?.emit('mark_notification_read', notificationId);
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const clearAll = async () => {
        try {
            await notificationService.clearAllNotifications();
            socket?.emit('clear_all_notifications');
        } catch (error) {
            console.error('Error al limpiar notificaciones:', error);
        }
    };

    const value = {
        socket,
        notifications,
        unreadCount,
        markAsRead,
        clearAll
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
    token: PropTypes.string
};

SocketProvider.defaultProps = {
    token: null
};

// Hook personalizado para usar el socket
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket debe ser usado dentro de un SocketProvider');
    }
    return context;
};

// Función para obtener el socket (reemplaza getSocket)
export const useGetSocket = () => {
    return useSocket();
};
