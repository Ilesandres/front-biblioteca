import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import googleAuthService from '../services/google-auth.service';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ email, password });
            if (!response.success) {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (response) => {
        try {
            const result = await googleAuthService.loginWithGoogle(response.credential);
            if (result.token && result.user) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión con Google');
        }
    };

    useEffect(() => {
        // Inicializar el botón de Google
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleLoginButton'),
                { theme: 'outline', size: 'large', width: '100%' }
            );
        }
    }, []);

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                    <div className="form-footer">
                        <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
                    </div>
                </form>
                <div className="google-login-container" style={{ marginTop: '20px' }}>
                    <div id="googleLoginButton"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
