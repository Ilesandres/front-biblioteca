import React from 'react';
import { useNotification } from '../context/NotificationContext';

// Este componente es un wrapper que facilita el uso del contexto de notificaciones
export const useGlobalNotification = () => {
    const { showNotification } = useNotification();

    const notify = {
        success: (message, duration) => {
            showNotification({
                message,
                severity: 'success',
                duration: duration || 6000
            });
        },
        error: (message, duration) => {
            showNotification({
                message,
                severity: 'error',
                duration: duration || 6000
            });
        },
        warning: (message, duration) => {
            showNotification({
                message,
                severity: 'warning',
                duration: duration || 6000
            });
        },
        info: (message, duration) => {
            showNotification({
                message,
                severity: 'info',
                duration: duration || 6000
            });
        }
    };

    return notify;
};