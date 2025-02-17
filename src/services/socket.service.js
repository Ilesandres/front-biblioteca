import io from 'socket.io-client';
import { toast } from 'react-toastify';

let socket = null;

export const initializeSocket = (token) => {
    if (!token) return null;

    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3005', {
        auth: {
            token
        }
    });

    socket.on('connect', () => {
        console.log('Conectado al servidor de WebSocket');
    });

    socket.on('error_chat', (error) => {
        toast.error(error.message);
    });

    socket.on('nueva_notificacion', (notificacion) => {
        toast.info(notificacion.mensaje);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}; 