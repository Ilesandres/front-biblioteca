import api from './api';

const bookService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 12, search, genero, disponible, ...rest } = params;
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...(search && { q: search }),
            ...(genero && { genero }),
            ...(disponible && { disponible }),
            ...rest
        });

        const response = await api.get(`/libros?${queryParams}`);
        return {
            data: response.data.data,
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            totalPages: response.data.pagination.pages
        };
    },

    getById: async (id) => {
        const response = await api.get(`/libros/${id}`);
        return response.data;
    },

    create: async (bookData) => {
        const formData = new FormData();
        Object.keys(bookData).forEach(key => {
            if (key === 'portada' && bookData[key] instanceof File) {
                formData.append(key, bookData[key]);
            } else {
                formData.append(key, bookData[key]);
            }
        });

        const response = await api.post('/libros', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    update: async (id, bookData) => {
        const formData = new FormData();
        Object.keys(bookData).forEach(key => {
            if (key === 'portada' && bookData[key] instanceof File) {
                formData.append(key, bookData[key]);
            } else {
                formData.append(key, bookData[key]);
            }
        });

        const response = await api.put(`/libros/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/libros/${id}`);
        return response.data;
    },

    search: async (query) => {
        const response = await api.get(`/libros/buscar`, { params: query });
        return response.data;
    }
};

export default bookService; 