import axios from 'axios';
import api from './api';

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
            // Log FormData contents for debugging
            console.log('FormData fields:');
            for (let pair of libroData.entries()) {
                console.log(pair[0], typeof pair[1], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
            }

            const portada = libroData.get('portada');
            if (!portada || !(portada instanceof File)) {
                throw new Error('La portada es requerida y debe ser un archivo válido');
            }

            const response = await axios.post(`${API_URL}/libros`, libroData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                },
                validateStatus: function (status) {
                    return status < 500;
                }
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Error del servidor: ${response.data.message || 'Error desconocido'}`);
            }

            return response.data;
        } catch (error) {
            console.error('Error al crear libro:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                throw new Error(error.response.data.message || 'Error en el servidor al crear el libro');
            }
            throw error;
        }
    },

    // Update book
    updateLibro: async (id, libroData) => {
        try {
            // Verify if libroData is already a FormData instance
            const formData = libroData instanceof FormData ? libroData : new FormData();
            
            // If libroData is not FormData, append all fields
            if (!(libroData instanceof FormData)) {
                Object.entries(libroData).forEach(([key, value]) => {
                    if (value === null || value === undefined) return;
                    
                    if (key === 'portada' && value instanceof File) {
                        formData.append('portada', value);
                    } else if (key === 'genero') {
                        if (Array.isArray(value)) {
                            value.forEach(cat => formData.append('genero[]', cat));
                        } else {
                            formData.append('genero', value);
                        }
                    } else {
                        formData.append(key, value);
                    }
                });
            }

            // Log FormData contents for debugging
            console.log('FormData fields:');
            for (let pair of formData.entries()) {
                console.log(pair[0], typeof pair[1], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
            }

            const response = await axios.put(`${API_URL}/libros/${id}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                },
                validateStatus: function (status) {
                    return status < 500; // Resolve only if status code is less than 500
                }
            });

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Error updating book');
            }

            return response.data;
        } catch (error) {
            console.error('Error updating book:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
                throw new Error(error.response.data.message || 'Error updating book');
            }
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