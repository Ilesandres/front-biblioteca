import api from './api';
const token = localStorage.getItem('token');

const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return {
            totalLibros: response.data.libros,
            usuariosActivos: response.data.usuarios,
            prestamosActivos: response.data.prestamosActivos,
            totalResenas: response.data.totalResenas,
            prestamosRecientes: response.data.prestamosRecientes,
            ultimasResenas: response.data.ultimasResenas
        };
    },

    getReports:async()=>{
        const response = await api.get('/files/')
        return response.data;
    },

    getReportByUserId: async () => {
        const response = await api.get('/files/list');
        return response.data;
    },
    downloadReport: async (fileId) => {
        const response = await api.get(`/files/download/${fileId}`, { 
            responseType: 'arraybuffer'
        });
        return response.data;
    },
    deleteReport: async (fileId) => {
       const response= await api.delete(`/files/${fileId}`)
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

    createUser: async (userData) => {
        const response = await api.post('/admin/usuarios', userData);
        return response.data;
    },

    // Book management functions
    getBooks: async () => {
        const response = await api.get('/libros');
        return response.data;
    },

    createBook: async (bookData) => {
        const formData = new FormData();
        
        Object.entries(bookData).forEach(([key, value]) => {
            if (key === 'portada' && value instanceof File) {
                formData.append('portada', value);
            } else if (key === 'genero' && Array.isArray(value)) {
                value.forEach(cat => formData.append('genero', cat));
            } else {
                formData.append(key, value);
            }
        });

        const response = await api.post('/libros', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateBook: async (bookId, bookData) => {
        const formData = new FormData();
        
        Object.entries(bookData).forEach(([key, value]) => {
            if (key === 'portada' && value instanceof File) {
                formData.append('portada', value);
            } else if (key === 'genero' && Array.isArray(value)) {
                value.forEach(cat => formData.append('genero', cat));
            } else {
                formData.append(key, value);
            }
        });

        const response = await api.put(`/libros/${bookId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteBook: async (bookId) => {
        const response = await api.delete(`/libros/${bookId}`);
        return response.data;
    }
};

export default adminService;