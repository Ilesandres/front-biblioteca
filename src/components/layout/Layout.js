import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Container,
    Avatar,
    Menu,
    MenuItem,
    Badge
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import NotificationList from '../notifications/NotificationList';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Biblioteca
                    </Typography>

                    {user && (
                        <>
                            <IconButton color="inherit" onClick={() => navigate('/chat')}>
                                <Badge badgeContent={0} color="error">
                                    <ChatIcon />
                                </Badge>
                            </IconButton>

                            <NotificationList />

                            <Box sx={{ ml: 2 }}>
                                <IconButton
                                    onClick={handleMenu}
                                    sx={{ p: 0 }}
                                >
                                    <Avatar alt={user.nombre}>
                                        {user.nombre ? user.nombre[0].toUpperCase() : ''}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={() => navigate('/profile')}>
                                        Mi Perfil
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/loans')}>
                                        Mis Préstamos
                                    </MenuItem>
                                    {user.rol === 'admin' && (
                                        <MenuItem onClick={() => navigate('/admin')}>
                                            Panel Admin
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout}>
                                        Cerrar Sesión
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                {children}
            </Container>

            <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} Biblioteca. Todos los derechos reservados.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;