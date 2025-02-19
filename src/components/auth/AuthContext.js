import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSocket, disconnectSocket } from '../../services/socket.service';
import { decodeToken, validateToken } from '../../utils/tokenUtils';
import api from '../../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                // First validate token format and expiration
                if (!validateToken(token)) {
                    throw new Error('Token is invalid or expired');
                }

                // Set initial user state from localStorage
                const parsedUser = JSON.parse(storedUser);
                if (!validateUserData(parsedUser)) {
                    throw new Error('Invalid stored user data');
                }
                setUser(parsedUser);
                
                try {
                    // Verify token validity with backend
                    const response = await api.get('/usuarios/perfil');
                    if (response.data) {
                        if (!validateUserData(response.data)) {
                            throw new Error('Invalid user data from server');
                        }
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                } catch (serverError) {
                    // If server validation fails, keep using stored data
                    console.warn('Could not validate with server, using stored credentials:', serverError);
                }
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const validateUserData = (userData) => {
        if (!userData || typeof userData !== 'object') return false;
        if (!userData.rol || typeof userData.rol !== 'string') return false;
        if (!['admin', 'user'].includes(userData.rol)) return false;
        if (!userData.email || typeof userData.email !== 'string') return false;
        return true;
    };

    const login = async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            const response = await api.post('/usuarios/login', credentials);
            const { token, user: userData } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            if (!validateUserData(userData)) {
                throw new Error('Invalid user data or role not defined');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            navigate(userData.rol === 'admin' ? '/admin' : '/');
            initializeSocket(token);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        disconnectSocket();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const updateUserData = (newData) => {
        if (!validateUserData({ ...user, ...newData })) {
            throw new Error('Invalid user data update');
        }
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/usuarios/register', userData);
            const { token, data: newUser } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            if (!validateUserData(newUser)) {
                throw new Error('Invalid user data or role not defined');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            initializeSocket(token);
            navigate(newUser.rol === 'admin' ? '/admin' : '/');
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Register error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al registrar usuario'
            };
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserData, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};