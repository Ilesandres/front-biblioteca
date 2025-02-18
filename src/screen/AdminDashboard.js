import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { useAuth } from '../components/auth/AuthContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Panel de Administración
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Bienvenido, {user?.nombre}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
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