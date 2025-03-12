import axios from 'axios';
import { API_URL } from '../../config';

export const getNotifications = async () => {
    try {
        const response = await axios.get(`${API_URL}/notificaciones`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/notificaciones/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const notificationApi = {
    getNotifications,
    markAsRead
};