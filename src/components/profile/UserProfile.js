import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Paper,
    Grid,
    Typography,
    Box,
    Avatar,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Divider,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Book as BookIcon,
    Star as StarIcon,
    History as HistoryIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../auth/AuthContext';
import userService from '../../services/user.service';

const validationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: Yup.string()
        .email('Email inválido')
        .required('El email es requerido'),
    password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
});

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
                <Icon sx={{ fontSize: 40, color }} />
                <Box>
                    <Typography color="text.secondary" variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h5">
                        {value}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const UserProfile = () => {
    const { user, setUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadUserStats();
        loadProfilePhoto();
    }, []);

    const loadProfilePhoto = async () => {
        if (user?.id) {
            try {
                const response = await userService.getProfilePhoto(user.id);
                if (response && response) {
                    setProfilePhoto(response);
                } else {
                    setProfilePhoto(null);
                }
            } catch (error) {
                console.error('Error al cargar la foto de perfil:', error);
                setProfilePhoto(null);
            }
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePhoto', file);
    
            try {
                setLoading(true);
                setError('');
                await userService.uploadProfilePhoto(formData);
                // After successful upload, fetch the updated photo
                await loadProfilePhoto();
            } catch (error) {
                setError('Error al subir la foto de perfil');
                console.error('Error al subir la foto:', error);
                setProfilePhoto(null);
            } finally {
                setLoading(false);
            }
        }
    };

    const loadUserStats = async () => {
        try {
            const response = await userService.getStats();
            setStats(response);
            
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
        }
    };

    const formik = useFormik({
        initialValues: {
            nombre: user?.username || user?.nombre || '',
            email: user?.email || '',
            password: '',
            confirmPassword: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError('');
                const updateData = {
                    nombre: values.nombre,
                    email: values.email
                };
                if (values.password) {
                    updateData.password = values.password;
                }
                const response = await userService.updateProfile(updateData);
                // Update the user data with the response
                const updatedUser = {
                    ...user,
                    username: response.data.nombre,
                    email: response.data.email
                };
                setUser(updatedUser);
                localStorage.removeItem('user');
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setEditing(false);
                // Reset password fields
                formik.setFieldValue('password', '');
                formik.setFieldValue('confirmPassword', '');
                // Show success message
                setError('');
            } catch (err) {
                console.log(user);
                console.log(err);
                setError(err.response?.data?.error || 'Error al actualizar el perfil');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Box position="relative" display="inline-block">
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem'
                                }}
                                src={profilePhoto}
                            >
                                {user?.username?.[0]?.toUpperCase() || user?.nombre?.[0]?.toUpperCase()}
                            </Avatar>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                            />
                            <IconButton
                                color="primary"
                                aria-label="subir foto"
                                component="span"
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                    position: 'absolute',
                                    bottom: 10,
                                    right: -10,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <PhotoCameraIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="h5" gutterBottom>
                            {user?.username || user?.nombre}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            {user?.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Miembro desde: {new Date(user?.createdAt).toLocaleDateString()}
                        </Typography>
                    </Paper>

                    {stats && (
                        <Box mt={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <StatCard
                                        title="Libros Prestados"
                                        value={stats.prestamos}
                                        icon={BookIcon}
                                        color="primary.main"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StatCard
                                        title="Reseñas Escritas"
                                        value={stats.reseñas}
                                        icon={StarIcon}
                                        color="secondary.main"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StatCard
                                        title="Préstamos Activos"
                                        value={stats.prestamosActivos}
                                        icon={HistoryIcon}
                                        color="warning.main"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">
                                Información Personal
                            </Typography>
                            <Button
                                startIcon={editing ? <CancelIcon /> : <EditIcon />}
                                onClick={() => setEditing(!editing)}
                                color={editing ? 'error' : 'primary'}
                            >
                                {editing ? 'Cancelar' : 'Editar'}
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="nombre"
                                        label="Nombre"
                                        value={formik.values.nombre}
                                        onChange={formik.handleChange}
                                        error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                                        helperText={formik.touched.nombre && formik.errors.nombre}
                                        disabled={!editing}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                        disabled={!editing}
                                    />
                                </Grid>

                                {editing && (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Cambiar Contraseña (opcional)
                                                </Typography>
                                            </Divider>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="password"
                                                label="Nueva Contraseña"
                                                type="password"
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                error={formik.touched.password && Boolean(formik.errors.password)}
                                                helperText={formik.touched.password && formik.errors.password}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="confirmPassword"
                                                label="Confirmar Contraseña"
                                                type="password"
                                                value={formik.values.confirmPassword}
                                                onChange={formik.handleChange}
                                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                            />
                                        </Grid>
                                    </>
                                )}

                                {editing && (
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="flex-end">
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={loading}
                                            >
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserProfile;