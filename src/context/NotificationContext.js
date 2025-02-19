import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { getSocket } from '../services/socket.service';
import { notificationService } from '../services/notification.service';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    // Cargar notificaciones iniciales
    useEffect(() => {
        const loadNotifications = async () => {
            if (user) {
                const notificacionesData = await notificationService.getNotifications();
                const notifications = Array.isArray(notificacionesData) ? notificacionesData.map(n => ({
                    ...n,
                    id: n.id,
                    read: n.leida,
                    tipo: n.tipo,
                    titulo: n.tipo.charAt(0).toUpperCase() + n.tipo.slice(1),
                    mensaje: n.mensaje,
                    createdAt: n.createdAt
                })) : [];
                // Sort notifications with unread ones at the top
                const sortedNotifications = [...notifications].sort((a, b) => {
                    if (a.read === b.read) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return a.read ? 1 : -1;
                });
                setNotifications(sortedNotifications);
                setUnreadCount(notifications.filter(n => !n.read).length);
            }
        };
        loadNotifications();
    }, [user]);

    // Manejar notificaciones en tiempo real
    useEffect(() => {
        const socket = getSocket();
        if (socket && user) {
            socket.on('nueva_notificacion', (notificacion) => {
                const formattedNotification = {
                    ...notificacion,
                    id: notificacion.id,
                    read: notificacion.leida,
                    tipo: notificacion.tipo,
                    titulo: notificacion.tipo.charAt(0).toUpperCase() + notificacion.tipo.slice(1),
                    mensaje: notificacion.mensaje,
                    createdAt: notificacion.createdAt
                };
                setNotifications(prev => {
                    const updatedNotifications = [formattedNotification, ...prev];
                    return updatedNotifications.sort((a, b) => {
                        if (a.read === b.read) {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        }
                        return a.read ? 1 : -1;
                    });
                });
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) {
                socket.off('nueva_notificacion');
            }
        };
    }, [user]);

    const markAsRead = async (notificationId) => {
        const success = await notificationService.markNotificationAsRead(notificationId);
        if (success) {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const clearAll = async () => {
        const success = await notificationService.clearAllNotifications();
        if (success) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
    }
    return context;
};