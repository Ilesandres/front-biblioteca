import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import { People, LibraryBooks, BookmarkBorder, LocalLibrary } from '@mui/icons-material';
import adminService from '../services/adminService';
import { useSnackbar } from 'notistack';

const AdminStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const loadStats = async () => {
        try {
            const statsData = await adminService.getStats();
            setStats(statsData);
        } catch (error) {
            enqueueSnackbar('Error al cargar las estadísticas', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        // Refresh stats every 5 minutes
        const interval = setInterval(loadStats, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const statCards = [
        {
            title: 'Total Usuarios',
            value: stats?.usuarios || 0,
            icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: 'Total Libros',
            value: stats?.libros || 0,
            icon: <LibraryBooks sx={{ fontSize: 40, color: 'secondary.main' }} />
        },
        {
            title: 'Préstamos Activos',
            value: stats?.prestamosActivos || 0,
            icon: <BookmarkBorder sx={{ fontSize: 40, color: 'warning.main' }} />
        },
        {
            title: 'Total Préstamos',
            value: stats?.prestamosTotal || 0,
            icon: <LocalLibrary sx={{ fontSize: 40, color: 'info.main' }} />
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Estadísticas Generales
            </Typography>
            <Grid container spacing={3}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                    transition: 'transform 0.3s ease-in-out'
                                }
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Typography variant="h4" component="div">
                                    {stat.value}
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default AdminStats;