import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import {
    Chat as ChatIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import chatService from '../../services/chat.service';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            setLoading(true);
            const response = await chatService.getChats();
            setChats(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar los chats');
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

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Chats de Soporte
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper>
                <List>
                    {chats.map((chat, index) => (
                        <React.Fragment key={chat.id}>
                            {index > 0 && <Divider />}
                            <ListItem
                                button
                                onClick={() => navigate(`/chat/${chat.id}`)}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={chat.usuario?.nombre || 'Usuario'}
                                    secondary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ChatIcon fontSize="small" />
                                            {new Date(chat.ultimoMensaje).toLocaleString()}
                                        </Box>
                                    }
                                />
                                <Chip
                                    label={chat.estado}
                                    color={chat.estado === 'activo' ? 'success' : 'default'}
                                    size="small"
                                />
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default ChatList; 