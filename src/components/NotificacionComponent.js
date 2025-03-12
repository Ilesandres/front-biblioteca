import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    List,
    ListItem,
    ListItemText,
    Typography,
    Button,
    Box
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
    getNotifications as getNotificaciones,
    markNotificationAsRead as marcarComoLeida,
    clearAllNotifications as marcarTodasComoLeidas,
    subscribe as suscribirNotificaciones
} from '../services/notification.service';

const NotificacionComponent = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Cargar notificaciones desde la API
    const cargarNotificaciones = async () => {
        try {
            const data = await getNotificaciones();
            setNotificaciones(data); 
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    useEffect(() => {
        cargarNotificaciones(); // Cargar al inicio

        // Suscribirse a WebSockets para recibir nuevas notificaciones en tiempo real
        const unsubscribe = suscribirNotificaciones((nuevaNotificacion) => {
            setNotificaciones(prev => [...prev, nuevaNotificacion]);
        });

        // Actualizar cada 30 segundos
        const intervalo = setInterval(cargarNotificaciones, 30000);

        return () => {
            clearInterval(intervalo);
            unsubscribe(); // Desuscribirse del WebSocket al desmontar
        };
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarcarComoLeida = async (id) => {
        try {
            await marcarComoLeida(id);
            setNotificaciones(prev => prev.map(n => (n.id === id ? { ...n, leida: true } : n)));
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const handleMarcarTodasComoLeidas = async () => {
        try {
            await marcarTodasComoLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="large"
                aria-controls={open ? 'notifications-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                color="inherit"
            >
                <Badge badgeContent={notificacionesNoLeidas} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                id="notifications-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: '350px',
                    },
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" component="div">
                        Notificaciones
                    </Typography>
                    {notificacionesNoLeidas > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarcarTodasComoLeidas}
                            sx={{ mt: 1 }}
                        >
                            Marcar todas como leídas
                        </Button>
                    )}
                </Box>

                <List sx={{ p: 0 }}>
                    {notificaciones.length > 0 ? (
                        notificaciones.map((notificacion) => (
                            <ListItem
                                key={notificacion.id}
                                onClick={() => handleMarcarComoLeida(notificacion.id)}
                                sx={{
                                    backgroundColor: notificacion.leida ? 'transparent' : 'action.hover',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                        cursor: 'pointer'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={notificacion.mensaje}
                                    secondary={new Date(notificacion.createdAt).toLocaleString()}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText
                                primary="No hay notificaciones"
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    )}
                </List>
            </Menu>
        </>
    );
};

export default NotificacionComponent;
