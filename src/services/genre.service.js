import axios from 'axios';
import { API_URL } from '../config';

const genreService = {
    getAllGenres: async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default genreService;