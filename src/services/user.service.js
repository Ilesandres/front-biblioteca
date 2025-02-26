import api from './api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/usuarios/perfil');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/usuarios/perfil', userData);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/usuarios/stats');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/usuarios/logout');
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response.data;
    }
};

export default userService;