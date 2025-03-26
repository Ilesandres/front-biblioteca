import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
    Button,
    IconButton,
    Badge,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import supportService from '../../services/support.service';
import SupportChat from './SupportChat';
import { useSocket } from '../../context/socketContext';

const TicketItem = ({ ticket, onAssign, isAssigned, onOpenChat }) => {
    return (
        <ListItem
            sx={{ 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: isAssigned ? 'action.selected' : 'warning.light'
            }}
        >
            <ListItemText
                primary={ticket.asunto}
                secondary={
                    <Box>
                        <Typography variant="body2">
                            Usuario: {ticket.nombreUsuario}
                        </Typography>
                        <Typography variant="body2">
                            Estado: {ticket.estado}
                        </Typography>
                        <Typography variant="body2">
                            Fecha: {new Date(ticket.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                }
            />
            <Box>
                {!isAssigned && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={onAssign}
                    >
                        Asignarme
                    </Button>
                )}
                <IconButton onClick={() => onOpenChat(ticket)}>
                    <Badge badgeContent={ticket.mensajesNoLeidos} color="primary">
                        <ChatIcon />
                    </Badge>
                </IconButton>
            </Box>
        </ListItem>
    );
};

const AgenteTicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const { user } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        if (user?.isAgente) {
            loadTickets();
        }

        if (socket) {
            socket.on('nuevo_mensaje_soporte', handleNewMessage);
            return () => {
                socket.off('nuevo_mensaje_soporte');
            };
        }
    }, [user, socket]);

    const handleNewMessage = () => {
        loadTickets();
    };

    const handleOpenChat = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseChat = () => {
        setSelectedTicket(null);
    };

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTickets();
            console.log(data);
            if (data && data.tickets) {
                // Filtrar tickets basado en el rol del agente
                const ticketsSinAsignar = data.tickets.filter(ticket => !ticket.agenteId && ticket.estado !== 'cerrado');
                const ticketsAsignados = data.tickets.filter(ticket => 
                    ticket.agenteId === user.agenteId && 
                    ticket.estado !== 'cerrado'
                );
                setTickets([...ticketsAsignados, ...ticketsSinAsignar]);
            } else {
                setTickets([]);
            }
            setError(null);
        } catch (error) {
            console.error('Error al cargar tickets:', error);
            setError('Error al cargar los tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            await supportService.assignTicket(ticketId, user.agenteId);
            await loadTickets(); // Recargar tickets después de la asignación
        } catch (error) {
            console.error('Error al asignar ticket:', error);
            setError('Error al asignar el ticket');
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
        </Box>
    );
    
    if (error) return (
        <Box my={2}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );

    const ticketsSinAsignar = tickets.filter(ticket => !ticket.agenteId);
    const ticketsAsignados = tickets.filter(ticket => ticket.agenteId === user.agenteId);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Tickets Sin Asignar
            </Typography>
            <List>
                {ticketsSinAsignar.map(ticket => (
                    <TicketItem 
                        key={`unassigned-${ticket.id}`}
                        ticket={ticket}
                        onAssign={() => handleAssignTicket(ticket.id)}
                        onOpenChat={handleOpenChat}
                    />
                ))}
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Mis Tickets Asignados
            </Typography>
            <List>
                {ticketsAsignados.map(ticket => (
                    <TicketItem 
                        key={`assigned-${ticket.id}`}
                        ticket={ticket}
                        isAssigned
                        onOpenChat={handleOpenChat}
                    />
                ))}
            </List>

            <Dialog 
                open={Boolean(selectedTicket)} 
                onClose={handleCloseChat}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">
                                {selectedTicket?.asunto}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Usuario: {selectedTicket?.nombreUsuario}
                            </Typography>
                        </Box>
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
        </Box>
    );
};

export default AgenteTicketList;