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
    Badge,
    useTheme,
    Tooltip,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationIcon,
    Chat as ChatIcon,
    Person as PersonIcon,
    Book as BookIcon,
    ExitToApp as LogoutIcon,
    Support as SupportIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import userService from '../../services/user.service';
import NotificationList from '../notifications/NotificationList';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await userService.logout();
            logout();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar 
                position="static" 
                elevation={0}
                sx={{ 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700, 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center',
                                color: theme.palette.primary.main
                            }}
                            onClick={() => navigate('/')}
                        >
                            <BookIcon sx={{ mr: 1, fontSize: 32 }} />
                            Biblioteca
                        </Typography>
                    </Box>

                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Chat">
                                <IconButton 
                                    color="primary" 
                                    onClick={() => navigate('/chat')}
                                    sx={{
                                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                                        mx: 1,
                                        '&:hover': {
                                            bgcolor: 'rgba(25, 118, 210, 0.15)',
                                        }
                                    }}
                                >
                                    <Badge badgeContent={0} color="error">
                                        <ChatIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <NotificationList />

                            <Box sx={{ ml: 2 }}>
                                <Tooltip title="Mi cuenta">
                                    <IconButton
                                        onClick={handleMenu}
                                        sx={{ 
                                            p: 0,
                                            ml: 1,
                                            border: '2px solid',
                                            borderColor: theme.palette.primary.main
                                        }}
                                    >
                                        <Avatar 
                                            alt={user.nombre}
                                            sx={{ 
                                                bgcolor: theme.palette.primary.main,
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {user.nombre ? user.nombre[0].toUpperCase() : ''}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            borderRadius: 2,
                                            minWidth: 200,
                                            mt: 1.5,
                                            '& .MuiMenuItem-root': {
                                                py: 1.5
                                            }
                                        }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                            {user.nombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                            {user.email || user.username}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                        <ListItemIcon>
                                            <PersonIcon fontSize="small" color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary="Mi Perfil" />
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/loans'); handleClose(); }}>
                                        <ListItemIcon>
                                            <BookIcon fontSize="small" color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary="Mis Préstamos" />
                                    </MenuItem>
                                    {user.rol === 'admin' && (
                                        <>
                                            <Divider sx={{ my: 1 }} />
                                            <MenuItem onClick={() => { navigate('/soporte'); handleClose(); }}>
                                                <ListItemIcon>
                                                    <SupportIcon fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary="Soporte" />
                                            </MenuItem>
                                            <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                                                <ListItemIcon>
                                                    <DashboardIcon fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary="Panel Admin" />
                                            </MenuItem>
                                        </>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ color: theme.palette.error.main }}
                                    >
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText primary="Cerrar Sesión" />
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    py: 4, 
                    px: { xs: 2, sm: 3, md: 4 },
                    maxWidth: { xl: '1400px' }
                }}
            >
                {children}
            </Container>

            <Box 
                component="footer" 
                sx={{ 
                    py: 3, 
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 'auto'
                }}
            >
                <Container maxWidth="lg">
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        align="center"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 500
                        }}
                    >
                        <BookIcon sx={{ mr: 1, fontSize: 18 }} />
                        © {new Date().getFullYear()} Biblioteca. Todos los derechos reservados.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;