import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    IconButton,
    Box,
    Badge,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Book as BookIcon,
    Chat as ChatIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/socketContext';

const getNotificationIcon = (tipo) => {
    switch (tipo) {
        case 'prestamo':
            return <BookIcon color="primary" />;
        case 'chat':
            return <ChatIcon color="info" />;
        case 'alerta':
            return <WarningIcon color="error" />;
        default:
            return <InfoIcon color="action" />;
    }
};

const NotificationList = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, clearAll } = useSocket();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        await markAsRead(notification.id);
        handleClose();

        // Navegar según el tipo de notificación
        switch (notification.tipo) {
            case 'prestamo':
                navigate('/loans');
                break;
            case 'chat':
                navigate('/chat');
                break;
            default:
                break;
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxHeight: 400,
                        width: '300px'
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Notificaciones
                    </Typography>
                    {notifications.length > 0 && (
                        <IconButton size="small" onClick={clearAll}>
                            <CheckIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                <Divider />

                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No hay notificaciones
                        </Typography>
                    </MenuItem>
                ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        bgcolor: notification.read ? 'transparent' : 'action.hover'
                                    }}
                                >
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.tipo)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={notification.titulo}
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2" component="span">
                                                    {notification.mensaje}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" component="span">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Menu>
        </>
    );
};

export default NotificationList; 