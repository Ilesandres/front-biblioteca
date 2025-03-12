import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { Box, Container, Typography, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import TicketList from './TicketList';
import NewTicketForm from './NewTicketForm';
import AdminTicketList from './AdminTicketList';
import AgentManagement from './AgentManagement';
import supportService from '../../services/support.service';

const SupportPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const loadTickets = async () => {
            try {
                setLoading(true);
                const response = await supportService.getTickets();
                setTickets(response.tickets || []);
                setError(null);
            } catch (err) {
                console.error('Error loading tickets:', err);
                setError('Error al cargar los tickets');
            } finally {
                setLoading(false);
            }
        };

        const validateUserRole = () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return null;

            const userData = JSON.parse(storedUser);
            if (userData.rol === 'admin') return 'admin';
            if (userData.isAgente) return 'agente';
            return 'usuario';
        };

        setUserRole(validateUserRole());
        loadTickets();
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading || !userRole) return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
        </Container>
    );

    if (error) return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Alert severity="error">{error}</Alert>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {userRole === 'admin' ? 'Panel de Soporte' : 
                     userRole === 'agente' ? 'Panel de Agente' : 'Centro de Ayuda'}
                </Typography>
                
                {(userRole === 'admin' || userRole === 'agente') ? (
                    <>
                        {userRole === 'admin' && (
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs value={activeTab} onChange={handleTabChange}>
                                    <Tab label="Tickets" />
                                    <Tab label="Gestión de Agentes" />
                                </Tabs>
                            </Box>
                        )}
                        
                        {userRole === 'admin' && activeTab === 1 ? (
                            <AgentManagement />
                        ) : (
                            <AdminTicketList tickets={tickets} />
                        )}
                    </>
                ) : (
                    <Box>
                        <NewTicketForm />
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                Mis Tickets
                            </Typography>
                            <TicketList tickets={tickets} />
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default SupportPage;