import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
    List
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import chatService from '../../services/chat.service';
import { getSocket } from '../../services/socket.service';
import ChatMessage from './ChatMessage';

const ChatWindow = () => {
    const { user } = useAuth();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        initializeChat();
        const socket = getSocket();
        if (socket) {
            socket.on('nuevo_mensaje', handleNewMessage);
        }
        return () => {
            if (socket) {
                socket.off('nuevo_mensaje');
            }
        };
    }, []);

    const initializeChat = async () => {
        try {
            setLoading(true);
            // Buscar chat activo o crear uno nuevo
            const response = await chatService.getChats();
            let activeChat = response.data.find(c => c.estado === 'activo');
            
            if (!activeChat) {
                const newChat = await chatService.createChat();
                activeChat = newChat.data;
            }

            setChat(activeChat);
            setMessages(activeChat.mensajes || []);
            setError('');
        } catch (err) {
            setError('Error al inicializar el chat');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (newMessage) => {
        if (newMessage.chatId === chat?.id) {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            setSending(true);
            await chatService.sendMessage(chat.id, message);
            setMessage('');
        } catch (err) {
            setError('Error al enviar el mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setSending(true);
            await chatService.uploadFile(chat.id, file);
        } catch (err) {
            setError('Error al subir el archivo');
        } finally {
            setSending(false);
            fileInputRef.current.value = '';
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
            <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">
                        Chat de Soporte
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <List>
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={msg.id || index}
                                message={msg}
                                isOwn={msg.usuarioId === user.id}
                            />
                        ))}
                    </List>
                    <div ref={messagesEndRef} />
                </Box>

                <Divider />

                <Box component="form" onSubmit={handleSend} sx={{ p: 2 }}>
                    <Box display="flex" gap={1}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <IconButton
                            color="primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={sending}
                        >
                            <AttachFileIcon />
                        </IconButton>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Escribe un mensaje..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={sending}
                        />
                        <IconButton
                            color="primary"
                            type="submit"
                            disabled={!message.trim() || sending}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ChatWindow; 