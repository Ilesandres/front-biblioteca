import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const libroService = {
    // Get all books
    getLibros: async () => {
        try {
            const response = await axios.get(`${API_URL}/libros`);
            return response.data;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    // Get book by ID
    getLibroById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/libros/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching book:', error);
            throw error;
        }
    },

    // Create new book
    crearLibro: async (libroData) => {
        try {
            const formData = new FormData();
            
            // Append book data
            Object.keys(libroData).forEach(key => {
                if (key === 'portada' && libroData[key] instanceof File) {
                    formData.append('portada', libroData[key]);
                } else if (key === 'categorias' && Array.isArray(libroData[key])) {
                    libroData[key].forEach(cat => formData.append('categorias', cat));
                } else {
                    formData.append(key, libroData[key]);
                }
            });

            const response = await axios.post(`${API_URL}/libros`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    },

    // Update book
    updateLibro: async (id, libroData) => {
        try {
            const formData = new FormData();
            
            // Append book data
            Object.keys(libroData).forEach(key => {
                if (key === 'portada' && libroData[key] instanceof File) {
                    formData.append('portada', libroData[key]);
                } else if (key === 'categorias' && Array.isArray(libroData[key])) {
                    libroData[key].forEach(cat => formData.append('categorias', cat));
                } else {
                    formData.append(key, libroData[key]);
                }
            });

            const response = await axios.put(`${API_URL}/libros/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    },

    // Delete book
    eliminarLibro: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/libros/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    },

    // Search books
    buscarLibros: async (query) => {
        try {
            const response = await axios.get(`${API_URL}/libros/buscar`, {
                params: { query }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

    // Update book cover
    actualizarPortada: async (id, portadaFile) => {
        try {
            const formData = new FormData();
            formData.append('portada', portadaFile);

            const response = await axios.put(`${API_URL}/libros/${id}/portada`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating book cover:', error);
            throw error;
        }
    }
};

export default libroService;