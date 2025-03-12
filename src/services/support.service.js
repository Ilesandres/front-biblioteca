import api from './api';

const supportService = {
    // Tickets
    getTickets: async () => {
        const response = await api.get('/support/tickets');
        return response.data;
    },

    getMyTickets: async () => {
        const response = await api.get('/support/tickets/mis-tickets');
        return response.data;
    },

    createTicket: async (data) => {
        const response = await api.post('/support/tickets', data);
        return response.data;
    },

    // Mensajes
    getTicketMessages: async (ticketId) => {
        const response = await api.get(`/support/tickets/${ticketId}/mensajes`);
        return response.data;
    },

    sendMessage: async (ticketId, mensaje) => {
        const response = await api.post(`/support/tickets/${ticketId}/mensajes`, { mensaje });
        return response.data;
    },

    // Acciones de tickets
    closeTicket: async (ticketId) => {
        const response = await api.put(`/support/tickets/${ticketId}/cerrar`);
        return response.data;
    },

    updateTicketStatus: async (ticketId, estado) => {
        const response = await api.put(`/support/tickets/${ticketId}/estado`, { estado });
        return response.data;
    },

    // Gestión de agentes
    getAgentes: async () => {
        const response = await api.get('/support/agentes');
        return response.data;
    },

    createAgente: async (usuarioId) => {
        const response = await api.post('/support/agentes', { usuarioId });
        return response.data;
    },

    removeAgente: async (usuarioId) => {
        const response = await api.delete(`/support/agentes/${usuarioId}`);
        return response.data;
    },

    updateAgenteEstado: async (usuarioId, estado) => {
        const response = await api.put(`/support/agentes/${usuarioId}/estado`, { estado });
        return response.data;
    },

    assignTicket: async (ticketId, agenteId) => {
        const response = await api.put(`/support/tickets/${ticketId}/asignar`, { agenteId });
        return response.data;
    }
};

export default supportService; 