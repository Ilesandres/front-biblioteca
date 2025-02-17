import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
    }

    connect() {
        this.socket = io('http://localhost:3005');

        this.socket.on('connect', () => {
            console.log('Conectado al servidor de WebSocket');
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                this.authenticate(user.id);
            }
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

    authenticate(userId) {
        if (this.socket) {
            this.socket.emit('authenticate', userId);
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