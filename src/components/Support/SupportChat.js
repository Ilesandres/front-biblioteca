import React, { useState, useEffect, useRef } from 'react';
import {
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
    Send as SendIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../components/auth/AuthContext';
import supportService from '../../services/support.service';
import { useSocket } from '../../context/socketContext';

const SupportChat = ({ ticketId, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();

    useEffect(() => {
        loadMessages();
        
        if (socket) {
            socket.on('nuevo_mensaje_soporte', handleNewMessage);
            socket.emit('join_ticket', ticketId);
        }

        return () => {
            if (socket) {
                socket.off('nuevo_mensaje_soporte');
                socket.emit('leave_ticket', ticketId);
            }
        };
    }, [ticketId, socket]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTicketMessages(ticketId);
            setMessages(data);
            setError('');
            scrollToBottom();
        } catch (err) {
            setError('Error al cargar los mensajes');
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (data) => {
        if (data.ticketId === ticketId) {
            setMessages(prev => [...prev, data.mensaje]);
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
            await supportService.sendMessage(ticketId, message);
            setMessage('');
        } catch (err) {
            setError('Error al enviar el mensaje');
        } finally {
            setSending(false);
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <List>
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                backgroundColor: message.tipo === user.rol ? 'primary.light' : 'grey.200',
                                p: 1,
                                borderRadius: 1,
                                maxWidth: '80%',
                                alignSelf: message.tipo === user.rol ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Typography variant="body2" color="textSecondary">
                                {message.nombreEmisor}
                            </Typography>
                            <Typography>{message.mensaje}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </Typography>
                        </Box>
                    ))}
                </List>
                <div ref={messagesEndRef} />
            </Box>

            <Divider />

            <Box component="form" onSubmit={handleSend} sx={{ p: 2 }}>
                <Box display="flex" gap={1}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={sending}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        multiline
                        maxRows={4}
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
        </Box>
    );
};

SupportChat.propTypes = {
    ticketId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default SupportChat; 