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
    Menu,
    MenuItem,
    CircularProgress,
    Select,
    FormControl,
    InputLabel,
    Button,
    Divider
} from '@mui/material';
import { 
    Chat as ChatIcon, 
    Close as CloseIcon,
    MoreVert as MoreVertIcon 
} from '@mui/icons-material';
import { useSocket } from '../../context/socketContext';
import { useAuth } from '../../components/auth/AuthContext';
import supportService from '../../services/support.service';
import SupportChat from './SupportChat';

const AdminTicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [error, setError] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedTicketForMenu, setSelectedTicketForMenu] = useState(null);
    const { socket } = useSocket();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [agentes, setAgentes] = useState([]);
    const [loadingAgentes, setLoadingAgentes] = useState(false);

    useEffect(() => {
        loadTickets();
        loadAgentes();
        
        if (socket) {
            socket.on('nuevo_mensaje_soporte', handleNewMessage);
            socket.on('ticket_actualizado', handleTicketUpdate);
            return () => {
                socket.off('nuevo_mensaje_soporte');
                socket.off('ticket_actualizado');
            };
        }
    }, [socket]);

    const loadAgentes = async () => {
        try {
            setLoadingAgentes(true);
            const data = await supportService.getAgentes();
            setAgentes(data.agentes || []);
        } catch (error) {
            console.error('Error al cargar agentes:', error);
        } finally {
            setLoadingAgentes(false);
        }
    };

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTickets();
            setTickets(data.tickets || []);
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

    const handleTicketUpdate = (data) => {
        loadTickets();
    };

    const handleOpenChat = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseChat = () => {
        setSelectedTicket(null);
    };

    const handleCloseTicket = async (ticketId) => {
        try {
            await supportService.closeTicket(ticketId);
            loadTickets();
            setMenuAnchorEl(null);
        } catch (err) {
            setError('Error al cerrar el ticket');
        }
    };

    const handleUpdateStatus = async (ticketId, estado) => {
        try {
            await supportService.updateTicketStatus(ticketId, estado);
            loadTickets();
            setMenuAnchorEl(null);
        } catch (err) {
            setError('Error al actualizar el estado del ticket');
        }
    };

    const handleAssignTicket = async (ticketId, agenteId) => {
        try {
            await supportService.assignTicket(ticketId, agenteId);
            loadTickets();
            setMenuAnchorEl(null);
        } catch (err) {
            setError('Error al asignar el ticket');
        }
    };

    const handleMenuOpen = (event, ticket) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedTicketForMenu(ticket);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedTicketForMenu(null);
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
        <Box>
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
                <List>
                    {tickets.map((ticket) => (
                        <ListItem
                            key={ticket.id}
                            secondaryAction={
                                <Box>
                                    <IconButton onClick={() => handleOpenChat(ticket)}>
                                        <Badge badgeContent={ticket.mensajesNoLeidos} color="primary">
                                            <ChatIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton onClick={(e) => handleMenuOpen(e, ticket)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                            }
                            sx={{ 
                                border: 1, 
                                borderColor: 'divider', 
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: !ticket.agenteAsignado ? 'warning.light' : 'inherit'
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>{ticket.asunto}</Typography>
                                        <Chip 
                                            label={ticket.agenteAsignado ? `Asignado a: ${ticket.agenteAsignado}` : 'Sin Asignar'}
                                            color={ticket.agenteAsignado ? 'info' : 'warning'}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
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
                                        {ticket.agenteAsignado && (
                                            <Typography variant="body2" color="textSecondary">
                                                Asignado a: {ticket.agenteAsignado}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem disabled>
                    <Typography variant="subtitle2">Cambiar Estado</Typography>
                </MenuItem>
                <MenuItem 
                    onClick={() => handleUpdateStatus(selectedTicketForMenu?.id, 'pendiente')}
                    disabled={selectedTicketForMenu?.estado === 'pendiente'}
                >
                    Pendiente
                </MenuItem>
                <MenuItem 
                    onClick={() => handleUpdateStatus(selectedTicketForMenu?.id, 'en_proceso')}
                    disabled={selectedTicketForMenu?.estado === 'en_proceso'}
                >
                    En Proceso
                </MenuItem>
                <MenuItem 
                    onClick={() => handleUpdateStatus(selectedTicketForMenu?.id, 'resuelto')}
                    disabled={selectedTicketForMenu?.estado === 'resuelto'}
                >
                    Resuelto
                </MenuItem>
                <Divider />
                <MenuItem disabled>
                    <Typography variant="subtitle2">Asignar a</Typography>
                </MenuItem>
                {loadingAgentes ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} />
                    </MenuItem>
                ) : agentes.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No hay agentes disponibles
                        </Typography>
                    </MenuItem>
                ) : (
                    agentes.map(agente => (
                        <MenuItem 
                            key={agente.id}
                            onClick={() => handleAssignTicket(selectedTicketForMenu?.id, agente.id)}
                            disabled={selectedTicketForMenu?.agenteId === agente.id}
                        >
                            {agente.nombre || agente.email} {agente.rol === 'admin' ? '(Admin)' : '(Agente)'}
                        </MenuItem>
                    ))
                )}
                <Divider />
                <MenuItem 
                    onClick={() => handleCloseTicket(selectedTicketForMenu?.id)}
                    disabled={selectedTicketForMenu?.estado === 'cerrado'}
                >
                    Cerrar Ticket
                </MenuItem>
            </Menu>

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
                            {selectedTicket?.agenteAsignado && (
                                <Typography variant="body2" color="textSecondary">
                                    Asignado a: {selectedTicket.agenteAsignado}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={selectedTicket?.estado} 
                                size="small"
                                color={getStatusColor(selectedTicket?.estado)}
                            />
                            <IconButton onClick={handleCloseChat}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
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

export default AdminTicketList;