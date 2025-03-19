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
    CardContent,
    Tabs,
    Tab
} from '@mui/material';
import {
    Book as BookIcon,
    Person as PersonIcon,
    LocalLibrary as LibraryIcon,
    Star as StarIcon,
    Subtitles
} from '@mui/icons-material';
import adminService from '../../services/admin.service';
import AdminUsers from './AdminUsers';
import AdminBooks from './AdminBooks';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImportExport from '../../screen/ImportExport';


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
    const [currentTab, setCurrentTab] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

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
            title: 'Soporte',
            description: 'Gestionar tickets y agentes de soporte',
            path: '/soporte'
        },
        {
            title: 'Reportes',
            description: 'Ver estadísticas y generar reportes',
            path: '/admin/reports'
        }
    ];

    useEffect(() => {
        if (!user || user.rol !== 'admin') {
            navigate('/login');
            return;
        }
        loadStats();
    }, [user, navigate]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const statsData = await adminService.getStats();
            setStats(statsData);
            setError('');
        } catch (err) {
            console.error('Error loading stats:', err);
            if (err.response?.status === 403) {
                setError('No tienes permisos para acceder a esta información');
            } else {
                setError('Error al cargar las estadísticas');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.rol !== 'admin') {
        return null;
    }

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

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case 0: // Dashboard
                return (
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
                                color="info.main"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Reseñas"
                                value={stats?.totalResenas || 0}
                                icon={StarIcon}
                                color="warning.main"
                            />
                        </Grid>
                    </Grid>
                );
            case 1: // Users
                return <AdminUsers />;
            case 2: // Books
                return <AdminBooks />;
            case 3: // Import/Export
                return <ImportExport />;
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Panel de Administración
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Bienvenido {user.username}!, 
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label="Dashboard" />
                    <Tab label="Usuarios" />
                    <Tab label="Libros" />
                    <Tab label="Importar/Exportar" />
                </Tabs>
            </Box>

            {renderTabContent()}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Préstamos Recientes
                        </Typography>
                        {stats?.prestamosRecientes?.map((prestamo, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    {prestamo.tituloLibro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Usuario: {prestamo.nombreUsuario}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha: {new Date(prestamo.fechaPrestamo).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Últimas Reseñas
                        </Typography>
                        {stats?.ultimasResenas?.map((resena, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    {resena.tituloLibro}
                                </Typography>
                                <Typography variant="body2">
                                    {resena.comentario}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Por: {resena.nombreUsuario}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha: {new Date(resena.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;