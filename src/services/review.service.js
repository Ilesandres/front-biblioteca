import api from './api';

const reviewService = {
    getByBook: async (bookId) => {
        const response = await api.get(`/resenas/libro/${bookId}`);
        return response.data;
    },

    create: async (reviewData) => {
        const response = await api.post('/resenas', reviewData);
        return response.data;
    },

    update: async (id, reviewData) => {
        const response = await api.put(`/resenas/${id}`, reviewData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/resenas/${id}`);
        return response.data;
    }
};

export default reviewService; 