import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../components/auth/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/admin/estadisticas`);
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Error al cargar las estadísticas');
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const adminFeatures = [
        {
            title: 'Gestión de Libros',
            description: 'Agregar, editar y eliminar libros del catálogo',
            path: '/admin/books'
        },
        {
            title: 'Gestión de Préstamos',
            description: 'Ver y gestionar los préstamos activos',
            path: '/admin/loans'
        },
        {
            title: 'Gestión de Usuarios',
            description: 'Administrar usuarios y sus roles',
            path: '/admin/users'
        },
        {
            title: 'Reportes',
            description: 'Ver estadísticas y generar reportes',
            path: '/admin/reports'
        }
    ];

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Panel de Administración
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Bienvenido, {user?.nombre}
            </Typography>
            
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Libros</Typography>
                        <Typography variant="h4">{stats?.libros || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Usuarios</Typography>
                        <Typography variant="h4">{stats?.usuarios || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Préstamos Activos</Typography>
                        <Typography variant="h4">{stats?.prestamosActivos || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Reseñas</Typography>
                        <Typography variant="h4">{stats?.totalResenas || 0}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Activities */}
            <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
                {/* Recent Loans */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Préstamos Recientes</Typography>
                        {stats?.prestamosRecientes?.map((prestamo, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle1">
                                    {prestamo.tituloLibro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Prestado a: {prestamo.nombreUsuario}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
                {/* Latest Reviews */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Últimas Reseñas</Typography>
                        {stats?.ultimasResenas?.map((resena, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle1">
                                    {resena.tituloLibro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Por: {resena.nombreUsuario}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Feature Cards */}
            <Grid container spacing={3}>
                {adminFeatures.map((feature, index) => (
                    <Grid item xs={12} md={6} lg={3} key={index}>
                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 200,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                            onClick={() => navigate(feature.path)}
                        >
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(feature.path);
                                }}
                            >
                                Acceder
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default AdminDashboard;