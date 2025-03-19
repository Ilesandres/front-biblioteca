import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from './AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Email inválido')
        .required('El email es requerido'),
    password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es requerida')
});

const Login = () => {
    const navigate = useNavigate();
    const { login,loginWithGoogle } = useAuth();
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setError('');
            const result = await login(values);
            if (!result.success) {
                setError(result.message || 'Error al iniciar sesión');
            }
        }
    });

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Iniciar Sesión
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Contraseña"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            margin="normal"
                        />

                        <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            type="submit"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Iniciar Sesión
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/register">Regístrate aquí</Link>
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                buttonText="Iniciar sesión con Google"
                                onSuccess={async (response) => {
                                    try {
                                    await loginWithGoogle(response.credential); // Esperamos la respuesta
                                    } catch (error) {
                                    console.error("Error en loginWithGoogle:", error);
                                    setError("Error al procesar la autenticación.");
                                    }
                                }}
                                onFailure={(error) => {
                                    console.error("Login Failed:", error);
                                    setError("Error al iniciar sesión con Google");
                                }}
                                cookiePolicy={"single_host_origin"}
                                />
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;