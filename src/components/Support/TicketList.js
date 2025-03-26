import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
    Chip,
    IconButton,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Fab,
    TextField
} from '@mui/material';
import { 
    Chat as ChatIcon, 
    Close as CloseIcon,
    Add as AddIcon 
} from '@mui/icons-material';
import { useSocket } from '../../context/socketContext';
import supportService from '../../services/support.service';
import SupportChat from './SupportChat';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [error, setError] = useState('');
    const { socket } = useSocket();
    const [loading, setLoading] = useState(false);
    const [openNewTicket, setOpenNewTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({
        asunto: '',
        mensaje: ''
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadTickets();
        
        if (socket) {
            socket.on('nuevo_mensaje_soporte', handleNewMessage);
            return () => {
                socket.off('nuevo_mensaje_soporte');
            };
        }
    }, [socket]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await supportService.getMyTickets();
            console.log(data);
            if (data && data.tickets) {
                setTickets(data.tickets);
            } else {
                setTickets([]);
            }
            setError('');
        } catch (error) {
            console.error('Error al cargar tickets:', error);
            setError('Error al cargar los tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (data) => {
        loadTickets();
    };

    const handleOpenChat = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseChat = () => {
        setSelectedTicket(null);
    };

    const handleOpenNewTicket = () => {
        setOpenNewTicket(true);
    };

    const handleCloseNewTicket = () => {
        setOpenNewTicket(false);
        setNewTicket({ asunto: '', mensaje: '' });
    };

    const handleCreateTicket = async () => {
        if (!newTicket.asunto.trim() || !newTicket.mensaje.trim()) {
            setError('Por favor completa todos los campos');
            return;
        }

        try {
            setCreating(true);
            const response = await supportService.createTicket(newTicket);
            setTickets(prevTickets => [response.ticket, ...prevTickets]);
            handleCloseNewTicket();
            setError('');
        } catch (err) {
            setError('Error al crear el ticket');
        } finally {
            setCreating(false);
        }
    };

    const getStatusColor = (estado) => {
        const colors = {
            pendiente: 'warning',
            en_proceso: 'info',
            resuelto: 'success',
            cerrado: 'default'
        };
        return colors[estado] || 'default';
    };

    return (
        <Box sx={{ position: 'relative', minHeight: '400px' }}>
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <List>
                        {tickets.map((ticket) => (
                            <ListItem
                                key={ticket.id}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleOpenChat(ticket)}>
                                        <Badge badgeContent={ticket.mensajesNoLeidos} color="primary">
                                            <ChatIcon />
                                        </Badge>
                                    </IconButton>
                                }
                                sx={{ 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 1,
                                    mb: 1
                                }}
                            >
                                <ListItemText
                                    primary={ticket.asunto}
                                    secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip 
                                                label={ticket.estado} 
                                                size="small"
                                                color={getStatusColor(ticket.estado)}
                                            />
                                            <Typography variant="body2">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Fab 
                        color="primary" 
                        sx={{ position: 'fixed', bottom: 24, right: 24 }}
                        onClick={handleOpenNewTicket}
                    >
                        <AddIcon />
                    </Fab>
                </>
            )}

            <Dialog 
                open={Boolean(selectedTicket)} 
                onClose={handleCloseChat}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {selectedTicket?.asunto}
                        </Typography>
                        <IconButton onClick={handleCloseChat}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedTicket && (
                        <SupportChat 
                            ticketId={selectedTicket.id} 
                            onClose={handleCloseChat}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={openNewTicket}
                onClose={handleCloseNewTicket}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            Crear Nuevo Ticket de Soporte
                        </Typography>
                        <IconButton onClick={handleCloseNewTicket}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Asunto"
                            fullWidth
                            value={newTicket.asunto}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, asunto: e.target.value }))}
                            disabled={creating}
                        />
                        <TextField
                            label="Mensaje"
                            fullWidth
                            multiline
                            rows={4}
                            value={newTicket.mensaje}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, mensaje: e.target.value }))}
                            disabled={creating}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewTicket} disabled={creating}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleCreateTicket} 
                        variant="contained" 
                        disabled={creating || !newTicket.asunto.trim() || !newTicket.mensaje.trim()}
                    >
                        {creating ? 'Creando...' : 'Crear Ticket'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketList; 