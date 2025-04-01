import api from './api';

const googleAuthService = {
    loginWithGoogle: async (credential) => {
        try {
            const response = await api.post('/usuarios/google/login', { credential });
            const { token, user } = response.data;
            
            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            return response.data;
        } catch (error) {
            console.log(error)
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Error en la autenticación con Google');
        }
    },

    registerWithGoogle: async (credential) => {
        try {
            const response = await api.post('/usuarios/google/register', { credential });
            const { token, user } = response.data;
            
            if (!token || !user) {
                throw new Error('No se recibieron datos completos del servidor');
            }
            
            return { token, user };
        } catch (error) {
            console.error('Error durante el registro con Google:', {
                mensaje: error.message,
                respuesta: error.response?.data,
                estado: error.response?.status
            });
            throw new Error(error.response?.data?.message || 'Error en el registro con Google');
        }
    }
};

export default googleAuthService;