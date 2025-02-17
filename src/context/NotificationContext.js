import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { getSocket } from '../services/socket.service';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.on('nueva_notificacion', (notificacion) => {
                setNotifications(prev => [notificacion, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) {
                socket.off('nueva_notificacion');
            }
        };
    }, []);

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
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