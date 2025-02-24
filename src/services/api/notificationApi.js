import axios from 'axios';
import { API_BASE_URL } from '../../config';

const getNotifications = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/notificaciones`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/notificaciones/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const notificationApi = {
    getNotifications,
    markNotificationAsRead
};