import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import {
    Book as BookIcon,
    Person as PersonIcon,
    LocalLibrary as LibraryIcon,
    Star as StarIcon
} from '@mui/icons-material';
import adminService from '../../services/admin.service';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4">
                        {value}
                    </Typography>
                </Box>
                <Icon sx={{ fontSize: 40, color }} />
            </Box>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getStats();
            setStats(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar las estadísticas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Panel de Administración
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Libros"
                        value={stats?.totalLibros || 0}
                        icon={BookIcon}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Usuarios Activos"
                        value={stats?.usuariosActivos || 0}
                        icon={PersonIcon}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Préstamos Activos"
                        value={stats?.prestamosActivos || 0}
                        icon={LibraryIcon}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Reseñas"
                        value={stats?.totalResenas || 0}
                        icon={StarIcon}
                        color="info.main"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Préstamos Recientes
                        </Typography>
                        {/* Aquí irá la tabla de préstamos recientes */}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Últimas Reseñas
                        </Typography>
                        {/* Aquí irá la lista de reseñas recientes */}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard; 