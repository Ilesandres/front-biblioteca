import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const adminService = {
    // Get general statistics
    getStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all users
    getUsers: async () => {
        try {
            const response = await api.get('/admin/usuarios');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all books
    getBooks: async () => {
        try {
            const response = await api.get('/admin/libros');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle user block status
    toggleUserBlock: async (userId, blocked) => {
        try {
            const response = await api.put(`/admin/usuarios/${userId}/bloquear`, { bloqueado: blocked });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/usuarios/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Export data
    exportData: async (entities) => {
        try {
            const response = await api.post('/admin/export', { entities });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Import data
    importData: async (data, entities) => {
        try {
            const response = await api.post('/admin/import', { data, entities });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default adminService;