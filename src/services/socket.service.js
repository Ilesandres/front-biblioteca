import io from 'socket.io-client';

let socket = null;

/**
 * Initialize socket connection with authentication token
 */
export const initializeSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    const BACKEND_URL = process.env.REACT_APP_API_URL1 || 'http://localhost:3005';

    socket = io(BACKEND_URL, {
        auth: { token },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
    });

    // Debug listeners
    socket.on('connect', () => {
        console.log('Socket conectado exitosamente');
    });

    socket.on('connect_error', (error) => {
        console.error('Error de conexión socket:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket desconectado:', reason);
    });

    socket.on('error', (error) => {
        console.error('Error general socket:', error);
    });

    // Conectar el socket
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
        // Remover todos los listeners antes de desconectar
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};