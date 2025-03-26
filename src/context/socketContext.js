import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { disconnectSocket, initializeSocket } from '../services/socket.service';
import notificationService from '../services/notification.service';
import { useGlobalNotification } from '../components/GlobalNotification';
import { useAuth } from '../components/auth/AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notify = useGlobalNotification();

    // Inicializar socket cuando cambia el usuario
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (user && token) {
            console.log('Inicializando socket con token para usuario:', user.email);
            const newSocket = initializeSocket(token);
            
            // Configurar listeners básicos del socket
            newSocket.on('connect', () => {
                console.log('Socket conectado exitosamente');
                // Cargar notificaciones iniciales después de la conexión
                loadNotifications();
            });

            newSocket.on('connect_error', (error) => {
                console.error('Error de conexión socket:', error.message);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket desconectado:', reason);
            });

            // Escuchar notificaciones pendientes
            newSocket.on('notificaciones_pendientes', (pendingNotifications) => {
                setNotifications(pendingNotifications);
                setUnreadCount(pendingNotifications.filter(n => !n.read).length);
                const notification = pendingNotifications[0];
                if (notification && !notification.read) {
                    notify.info(notification.mensaje);
                }
            });

            // Escuchar nuevas notificaciones
            newSocket.on('nueva_notificacion', (notification) => {
                console.log('Nueva notificación recibida:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                notify.info(notification.mensaje);
            });

            // Escuchar actualizaciones de notificaciones
            newSocket.on('notification_update', (updatedNotification) => {
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
            newSocket.on('notifications_cleared', () => {
                console.log('Todas las notificaciones marcadas como leídas');
                setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
                setUnreadCount(0);
            });

            setSocket(newSocket);

            return () => {
                console.log('Limpiando socket y sus listeners');
                if (newSocket) {
                    newSocket.removeAllListeners();
                    disconnectSocket();
                }
                setSocket(null);
            };
        } else {
            if (socket) {
                console.log('Usuario no autenticado, desconectando socket');
                socket.removeAllListeners();
                disconnectSocket();
                setSocket(null);
            }
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

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
    children: PropTypes.node.isRequired
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket debe ser usado dentro de un SocketProvider');
    }
    return context;
};
