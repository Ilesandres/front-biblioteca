import api from './api';
import { getSocket } from './socket.service';

const chatService = {
    getChats: async () => {
        const response = await api.get('/chats');
        return response.data;
    },

    getChatById: async (chatId) => {
        const response = await api.get(`/chats/${chatId}`);
        return response.data;
    },

    createChat: async (tipo = 'soporte') => {
        const response = await api.post('/chats', { tipo });
        return response.data;
    },

    sendMessage: async (chatId, mensaje, tipo = 'texto') => {
        const socket = getSocket();
        if (socket) {
            socket.emit('enviar_mensaje', {
                chatId,
                mensaje,
                tipo
            });
        }
        const response = await api.post(`/chats/${chatId}/mensajes`, {
            mensaje,
            tipo
        });
        return response.data;
    },

    closeChat: async (chatId) => {
        const response = await api.put(`/chats/${chatId}/cerrar`);
        return response.data;
    },

    uploadFile: async (chatId, file) => {
        const formData = new FormData();
        formData.append('archivo', file);

        const response = await api.post(`/chats/${chatId}/archivos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default chatService; 