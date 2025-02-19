import axios from 'axios';
import { API_URL } from '../config';

const getNotificaciones = async () => {
    try {
        const response = await axios.get(`${API_URL}/notificaciones`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const marcarComoLeida = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/notificaciones/${id}/leer`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const marcarTodasComoLeidas = async () => {
    try {
        const response = await axios.put(`${API_URL}/notificaciones/leer-todas`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export {
    getNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas
};