import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DynamicFavicon = () => {
    const location = useLocation();

    useEffect(() => {
        const updateFavicon = () => {
            const favicon = document.querySelector('link[rel="icon"]');
            const path = location.pathname;

            // Definir el icono según la ruta
            let iconPath = '/favicon.ico'; // Icono por defecto

            if (path.startsWith('/book')) {
                iconPath = '/icons/book.ico';
            } else if (path.startsWith('/admin')) {
                iconPath = '/icons/admin.ico';
            } else if (path.startsWith('/loans')) {
                iconPath = '/icons/loan.ico';
            } else if (path.startsWith('/profile')) {
                iconPath = '/icons/profile_.ico';
            } else if (path.startsWith('/chat')) {
                iconPath = '/icons/chat.ico';
            } else if (path.startsWith('/soporte')) {
                iconPath = '/icons/support.ico';
            }

            // Actualizar el favicon
            if (favicon) {
                favicon.href = iconPath;
            }
        };

        updateFavicon();
    }, [location]);

    return null;
};

export default DynamicFavicon;