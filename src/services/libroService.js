import axios from 'axios';
import api from './api';
import { Token } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const token=localStorage.getItem('token');


const libroService = {
    // Get all books with filters
    getLibros: async (filters = {}) => {
        try {
            const { search, genero, disponible, page, limit } = filters;
            const hasFilters = search || genero || disponible || page || limit;
            
            // Use search endpoint if filters are present, otherwise use general endpoint
            const endpoint = hasFilters ? '/libros/buscar' : '/libros';
            
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (genero) params.append('genero', genero);
            if (disponible) params.append('disponible', disponible);
            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);

            const queryString = params.toString();
            const url = `${API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axios.get(url, {
                validateStatus: function (status) {
                    return status < 500;
                }
            });
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
            
            const portada = libroData.get('portada');
            const allowedTypes=['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!portada || !(portada instanceof File)) {
                throw new Error('La portada es requerida y debe ser un archivo válido');
            }
            for(let pair of libroData.entries()) {
                console.log(pair[0] + ':', pair[1]);
                if(pair[0]==='portada'){
                    if(!allowedTypes.includes(portada.type)){
                        const message='El tipo de archivo no es permitido. Solo se permiten imágenes.';
                        const data={
                            response:{
                                data:{
                                    error:{
                                        message:message
                                    }
                                }
                            }
                        }
                          console.log(data)
                        throw data;
                    }
                }
            }

            const response = await axios.post(`${API_URL}/libros`, libroData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization':`Bearer ${token}`
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
            throw error;
        }
    },

    // Update book
    updateLibro: async (id, libroData) => {
        try {
            // Verify if libroData is already a FormData instance
            const formData = libroData instanceof FormData ? libroData : new FormData();
            console.log('actualizando libro')
            
            const allowedTypes= ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            console.log(!(libroData instanceof FormData))
            for (let pair of formData.entries()) {
                console.log(pair[0] + ':', pair[1]);
                if(pair[0]==='portada'){
                    console.log('portada')
                    if(!allowedTypes.includes(pair[1].type)){
                        const message='El tipo de archivo no es permitido. Solo se permiten imágenes.';
                        const data={
                            response:{
                                data:{
                                    error:{
                                        message:message
                                    }
                                }
                            }
                        }
                          console.log(data)
                        throw data;
                    }
                }
            }
            
            
            // If libroData is not FormData, append all fields
            if (!(libroData instanceof FormData)) {
                Object.entries(libroData).forEach(([key, value]) => {
                    if (value === null || value === undefined) return;
                    
                    if (key === 'portada' && value instanceof File) {
                        if(!allowedTypes.includes(value.type)){
                           const message='El tipo de archivo no es permitido. Solo se permiten imágenes.';
                           console.log(message)
                           throw new Error(message); 
                        }

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

            const response = await axios.put(`${API_URL}/libros/${id}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization':`Bearer ${token}`
                },
                validateStatus: function (status) {
                    console.log('1ra validacion')
                    return status < 500; // Resolve only if status code is less than 500
                }
            });

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Error updating book');
            }

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