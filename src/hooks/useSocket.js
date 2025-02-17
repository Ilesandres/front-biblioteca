import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth'; // Tu hook de autenticación

export const useSocket = () => {
    const { token, isAdmin } = useAuth();
    const socket = useRef();

    useEffect(() => {
        // Conectar al WebSocket
        socket.current = io(process.env.REACT_APP_BACKEND_URL, {
            auth: {
                token,
                isAdmin
            }
        });

        // Manejar eventos
        socket.current.on('nueva_notificacion', (notificacion) => {
            // Manejar notificación
        });

        socket.current.on('nuevo_mensaje', (mensaje) => {
            // Manejar nuevo mensaje
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [token, isAdmin]);

    return socket.current;
}; 