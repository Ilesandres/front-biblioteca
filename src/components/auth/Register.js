import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from './AuthContext';
import googleAuthService from '../../services/google-auth.service';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';

const Register = () => {
    React.useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleRegister
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleRegisterButton'),
                { theme: 'outline', size: 'large', width: '100%' }
            );
        }
    }, []);
    const navigate = useNavigate();
    const { register,registerWithGoogle } = useAuth();
    const [error, setError] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isGoogleRegistration, setIsGoogleRegistration] = React.useState(false);

    const validationSchema = React.useMemo(() => {
        if (isGoogleRegistration) return Yup.object({});
        return Yup.object({
            nombre: Yup.string()
                .required('El nombre es requerido')
                .min(2, 'El nombre debe tener al menos 2 caracteres'),
            email: Yup.string()
                .email('Email inválido')
                .required('El email es requerido'),
            password: Yup.string()
                .min(6, 'La contraseña debe tener al menos 6 caracteres')
                .required('La contraseña es requerida'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .required('Confirma tu contraseña')
        });
    }, [isGoogleRegistration]);

    const handleGoogleRegister = async (response) => {
        try {
            setError('');
            setIsSubmitting(true);
            setIsGoogleRegistration(true);
            formik.setTouched({});
            formik.setErrors({});
            await registerWithGoogle(response.credential);
            
        } catch (error) {
            console.error('Google Register Error:', error);
            setError(error.message || 'Error al procesar el registro con Google');
        } finally {
            setIsSubmitting(false);
            setIsGoogleRegistration(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            nombre: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema,
        validateOnMount: false,
        onSubmit: async (values) => {
            try {
                setError('');
                setIsSubmitting(true);
                const { confirmPassword, ...registerData } = values;
                const result = await register(registerData);
                if (result.success) {
                    navigate('/');
                } else {
                    setError(result.message || 'Error al registrarse');
                }
            } catch (error) {
                setError('Error al procesar el registro');
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Registro
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="nombre"
                            name="nombre"
                            label="Nombre"
                            value={formik.values.nombre}
                            onChange={formik.handleChange}
                            error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                            helperText={formik.touched.nombre && formik.errors.nombre}
                            margin="normal"
                        />

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

                        <TextField
                            fullWidth
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirmar Contraseña"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            margin="normal"
                        />

                        <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            type="submit"
                            disabled={isSubmitting}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </Button>

                        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <div id="googleRegisterButton"></div>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login">Inicia sesión aquí</Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;