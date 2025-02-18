import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token) => {
    try {
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getRoleFromToken = (token) => {
    const decoded = decodeToken(token);
    return decoded?.rol || null;
};

export const validateToken = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return false;
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
};