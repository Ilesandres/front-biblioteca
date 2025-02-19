import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3005/api'; // Updated port to match backend

const api = axios.create({
    baseURL: API_URL
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Let axios set the correct Content-Type for FormData
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Solo redirigimos si no estamos ya en la página de login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
                toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            }
        } else {
            // Otros errores
            const message = error.response?.data?.message || 'Error en la operación';
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default api;