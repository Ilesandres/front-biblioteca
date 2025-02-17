import api from './api';

const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getRecentLoans: async () => {
        const response = await api.get('/admin/prestamos/recientes');
        return response.data;
    },

    getRecentReviews: async () => {
        const response = await api.get('/admin/resenas/recientes');
        return response.data;
    },

    getOverdueLoans: async () => {
        const response = await api.get('/admin/prestamos/atrasados');
        return response.data;
    },

    getUserStats: async () => {
        const response = await api.get('/admin/usuarios/stats');
        return response.data;
    }
};

export default adminService; 