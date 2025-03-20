import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSocket, disconnectSocket } from '../../services/socket.service';
import { decodeToken, validateToken } from '../../utils/tokenUtils';
import api from '../../services/api';
import googleAuthService from '../../services/google-auth.service';

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
        // Validate basic user data and role
        if (!userData || typeof userData !== 'object') return false;
        if (!userData.email || typeof userData.email !== 'string') return false;
        if (!userData.rol || typeof userData.rol !== 'string') return false;
        // Validate agent-specific fields if present
        if ('isAgente' in userData && typeof userData.isAgente !== 'boolean') return false;
        if ('agenteId' in userData && userData.agenteId !== null && typeof userData.agenteId !== 'number') return false;
        if ('estadoAgente' in userData && userData.estadoAgente !== null && typeof userData.estadoAgente !== 'string') return false;
        return true;
    };

    const login = async (credentials) => {
        try {
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    message: 'El email y la contraseña son requeridos'
                };
            }

            const response = await api.post('/usuarios/login', credentials);
            const { token, user: userData } = response.data;
            
            if (!token) {
                return {
                    success: false,
                    message: 'Error de autenticación: Token no recibido'
                };
            }

            if (!validateUserData(userData)) {
                return {
                    success: false,
                    message: 'Error de autenticación: Datos de usuario inválidos'
                };
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            navigate(userData.rol === 'admin' ? '/admin' : '/');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            let errorMessage = 'Error al iniciar sesión';
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Credenciales inválidas';
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.request) {
                errorMessage = 'No se pudo conectar con el servidor';
            }
            
            return {
                success: false,
                message: errorMessage
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
            // Validate required fields
            if (!userData.nombre || !userData.email || !userData.password) {
                return {
                    success: false,
                    message: 'Todos los campos son requeridos'
                };
            }

            const response = await api.post('/usuarios/register', userData);
            const { token, user: newUser } = response.data;

            if (!token) {
                throw new Error('No token received from server');
            }

            if (!validateUserData(newUser)) {
                throw new Error('Invalid user data or role not defined');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            navigate(newUser.rol === 'admin' ? '/admin' : '/');
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Register error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                success: false,
                message: error.response?.data?.message || 
                        (error.response?.status === 400 ? 'Error de validación: Verifica los datos ingresados' : 
                        error.message || 'Error al registrar usuario')
            };
        }
    };

    const registerWithGoogle = async (userData) => {
        try {
            const response = await googleAuthService.registerWithGoogle(userData);
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);
                navigate(response.user.rol === 'admin'? '/admin' : '/');
                return { success: true, user: response.user };
            } else {
                return { success: false, message: 'Error al registrar con Google' };
            }
        } catch (error) {
            console.error('Google Register Error:', error);
            return {
                success: false,
                message: error.message || 'Error al procesar el registro con Google'
            };
        }
    };

    const loginWithGoogle = async (userData) => {
        try {
            const response = await googleAuthService.loginWithGoogle(userData);
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);
                navigate(response.user.rol === 'admin'? '/admin' : '/');
                return { success: true, user: response.user };
            } else {
                return { success: false, message: 'Error al iniciar sesión con Google' };
            }
        } catch (error) {
            console.error('Google Login Error:', error);
            return {
                success: false,
                message: error.message || 'Error al procesar el inicio de sesión con Google'
            };
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            login, 
            logout, 
            updateUserData, 
            register, 
            registerWithGoogle,
            loginWithGoogle,
            loading,
            isAgente: user?.isAgente || false,
            agenteId: user?.agenteId || null,
            estadoAgente: user?.estadoAgente || null
        }}>
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