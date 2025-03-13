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
            console.log('Conectando al socket para el ticket:', ticketId);
            socket.on('nuevo_mensaje_soporte', handleNewMessage);
            socket.emit('join_ticket', ticketId);

            return () => {
                console.log('Desconectando del socket para el ticket:', ticketId);
                socket.off('nuevo_mensaje_soporte');
                socket.emit('leave_ticket', ticketId);
            };
        } else {
            console.log('Socket no disponible para el ticket:', ticketId);
        }
    }, [ticketId, socket]);

    const handleNewMessage = (data) => {
        console.log('Nuevo mensaje recibido - Datos completos:', data);
        if (parseInt(data.ticketId) === ticketId) {
            setMessages(prevMessages => {
                const messageExists = prevMessages.some(msg => msg.mensajeId === data.mensajeId);
                if (!messageExists) {
                    console.log('Agregando nuevo mensaje al estado');
                    return [...prevMessages, data];
                }
                console.log('Mensaje duplicado detectado - ignorando');
                return prevMessages;
            });
            scrollToBottom();
        } else {
            console.log('Mensaje ignorado - No corresponde al ticket actual:', {
                mensajeTicketId: data.ticketId,
                ticketActual: ticketId
            });
        }
    };

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            setSending(true);
            if (socket) {
                socket.emit('send_support_message', {
                    ticketId: ticketId,
                    contenido: message,
                    usuarioId: user.id,
                    tipoMensaje: user.rol
                });
            }
            setMessage('');
        } catch (err) {
            setError('Error al enviar el mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', maxHeight: '80vh' }}>
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <List sx={{ 
                    width: '100%', 
                    padding: 1,
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1.5
                }}>
                    {messages.map((message) => {
                        const isUserMessage = message.tipo === user.rol;
                        const isSupport = message.tipo === 'support';
                        const messageTime = new Date(message.createdAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return (
                            <Box
                                key={message.mensajeId}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isUserMessage ? 'flex-end' : 'flex-start',
                                    width: '100%',
                                    mb: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: isSupport ? '#4CAF50' : (isUserMessage ? '#007AFF' : '#E8E8E8'),
                                        color: isSupport || isUserMessage ? 'white' : 'black',
                                        p: 2,
                                        borderRadius: 2,
                                        maxWidth: '75%',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontSize: '0.875rem',
                                            mb: 0.5,
                                            color: isSupport || isUserMessage ? 'rgba(255,255,255,0.9)' : '#666',
                                            fontWeight: isSupport ? 600 : 400
                                        }}
                                    >
                                        {message.nombreEmisor}
                                    </Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                        {message.mensaje}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            textAlign: 'right',
                                            mt: 0.5,
                                            color: isSupport || isUserMessage ? 'rgba(255,255,255,0.7)' : '#999'
                                        }}
                                    >
                                        {messageTime}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </List>
                <div ref={messagesEndRef} />
            </Box>

            <Box
                component="form"
                onSubmit={handleSend}
                sx={{
                    p: 2,
                    backgroundColor: '#fff',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center'
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    multiline
                    maxRows={4}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            backgroundColor: '#f8f9fa',
                            '&.Mui-focused': {
                                backgroundColor: '#fff'
                            }
                        }
                    }}
                />
                <IconButton
                    type="submit"
                    color="primary"
                    disabled={sending || !message.trim()}
                    sx={{
                        backgroundColor: '#007AFF',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#0056b3'
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#e0e0e0',
                            color: '#9e9e9e'
                        }
                    }}
                >
                    {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
            </Box>
        </Box>
    );
};

SupportChat.propTypes = {
    ticketId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired
};

export default SupportChat;