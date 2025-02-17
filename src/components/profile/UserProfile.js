import React, { useState, useEffect } from 'react';
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
    CardContent
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Book as BookIcon,
    Star as StarIcon,
    History as HistoryIcon
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

    useEffect(() => {
        loadUserStats();
    }, []);

    const loadUserStats = async () => {
        try {
            const response = await userService.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
        }
    };

    const formik = useFormik({
        initialValues: {
            nombre: user?.nombre || '',
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
                setUser(response.data);
                setEditing(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al actualizar el perfil');
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
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {user?.nombre?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" gutterBottom>
                            {user?.nombre}
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
                                        value={stats.totalPrestamos}
                                        icon={BookIcon}
                                        color="primary.main"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StatCard
                                        title="Reseñas Escritas"
                                        value={stats.totalResenas}
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