import io from 'socket.io-client';
import { toast } from 'react-toastify';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeSocket = (token) => {
    if (!token) return null;

    if (socket?.connected) {
        return socket;
    }

    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3005', {
        auth: {
            token
        },
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('Conectado al servidor de WebSocket');
        reconnectAttempts = 0;
        toast.success('Conexión establecida con el servidor');
    });

    socket.on('connect_error', (error) => {
        console.error('Error de conexión:', error);
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            toast.error('No se pudo establecer conexión con el servidor');
            disconnectSocket();
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('Desconectado del servidor:', reason);
        if (reason === 'io server disconnect') {
            // El servidor forzó la desconexión
            disconnectSocket();
        }
    });

    socket.on('error_chat', (error) => {
        console.error('Error en el chat:', error);
        toast.error(error.message);
    });

    socket.on('nueva_notificacion', (notificacion) => {
        if (notificacion && notificacion.mensaje) {
            toast.info(notificacion.mensaje);
        }
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('error_chat');
        socket.off('nueva_notificacion');
        socket.disconnect();
        socket = null;
        reconnectAttempts = 0;
    }
};