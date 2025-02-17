import api from './api';

const loanService = {
    getAll: async (params = {}) => {
        const response = await api.get('/prestamos', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/prestamos/${id}`);
        return response.data;
    },

    getUserLoans: async () => {
        const response = await api.get('/prestamos/usuario');
        return response.data;
    },

    create: async (loanData) => {
        const response = await api.post('/prestamos', loanData);
        return response.data;
    },

    return: async (id) => {
        const response = await api.put(`/prestamos/${id}/devolver`);
        return response.data;
    },

    extend: async (id) => {
        const response = await api.put(`/prestamos/${id}/extender`);
        return response.data;
    }
};

export default loanService; 