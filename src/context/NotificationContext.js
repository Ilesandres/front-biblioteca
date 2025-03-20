import React, { createContext, useContext, useCallback } from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe ser usado dentro de NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const showNotification = useCallback(({ message, severity = 'info', duration = 5000 }) => {
        const toastConfig = {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: duration,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
            style: {
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '14px',
                fontWeight: '500'
            }
        };

        switch (severity) {
            case 'success':
                toast.success(message, toastConfig);
                break;
            case 'error':
                toast.error(message, toastConfig);
                break;
            case 'warning':
                toast.warning(message, toastConfig);
                break;
            case 'info':
            default:
                toast.info(message, toastConfig);
                break;
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <ToastContainer
                style={{
                    '--toastify-icon-color-success': '#10B981',
                    '--toastify-icon-color-error': '#EF4444',
                    '--toastify-icon-color-warning': '#F59E0B',
                    '--toastify-icon-color-info': '#3B82F6',
                    '--toastify-color-progress-success': '#10B981',
                    '--toastify-color-progress-error': '#EF4444',
                    '--toastify-color-progress-warning': '#F59E0B',
                    '--toastify-color-progress-info': '#3B82F6'
                }}
                transition={Slide}
            />
        </NotificationContext.Provider>
    );
};
