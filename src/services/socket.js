import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
    }

    connect() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3005', {
            auth: {
                token: token,
                isAdmin: JSON.parse(localStorage.getItem('user'))?.isAdmin || false
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servidor de WebSocket');
        });

        this.socket.on('newMessage', (message) => {
            this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('userOnline', (userId) => {
            console.log('Usuario en línea:', userId);
        });

        this.socket.on('userOffline', (userId) => {
            console.log('Usuario desconectado:', userId);
        });
    }

    authenticate() {
        const token = localStorage.getItem('token');
        if (this.socket && token) {
            this.socket.auth = { token };
            this.socket.connect();
        }
    }

    sendMessage(receiverId, content) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('No hay conexión con el servidor'));
                return;
            }

            this.socket.emit('privateMessage', { receiverId, content });
            
            this.socket.once('messageSent', (message) => {
                console.log('Mensaje enviado confirmado:', message);
                resolve(message);
            });

            this.socket.once('messageError', (error) => {
                console.error('Error al enviar mensaje:', error);
                reject(error);
            });

            setTimeout(() => {
                reject(new Error('Timeout al enviar mensaje'));
            }, 5000);
        });
    }

    onNewMessage(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();