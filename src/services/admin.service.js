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
    },

    // User management functions
    getUsers: async () => {
        const response = await api.get('/admin/usuarios');
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await api.put(`/admin/usuarios/${userId}`, userData);
        return response.data;
    },

    updateUserStatus: async (userId, status) => {
        const response = await api.put(`/admin/usuarios/${userId}/estado`, { estado: status });
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/usuarios/${userId}`);
        return response.data;
    },

    // Book management functions
    getBooks: async () => {
        const response = await api.get('/libros');
        return response.data;
    },

    createBook: async (bookData) => {
        const response = await api.post('/libros', bookData);
        return response.data;
    },

    updateBook: async (bookId, bookData) => {
        const response = await api.put(`/libros/${bookId}`, bookData);
        return response.data;
    },

    deleteBook: async (bookId) => {
        const response = await api.delete(`/libros/${bookId}`);
        return response.data;
    }
};

export default adminService;