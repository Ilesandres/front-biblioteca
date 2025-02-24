import io from 'socket.io-client';

let socket = null;

/**
 * Initialize socket connection with authentication token
 */
export const initializeSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    socket = io(BACKEND_URL, {
        auth: { token },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Conectado al servidor de WebSocket');
    });

    socket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Desconectado del servidor de WebSocket:', reason);
        if (reason === 'io server disconnect') {
            disconnectSocket();
        }
    });

    socket.on('error_chat', (error) => {
        console.error('Error en el chat:', error);
    });

    socket.connect();

    return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect and cleanup socket connection
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('error_chat');
        socket.off('nueva_notificacion');
        socket.disconnect();
        socket = null;
    }
};