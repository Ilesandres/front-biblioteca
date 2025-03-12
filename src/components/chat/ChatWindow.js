import React from 'react';
import { Container, Paper } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import AdminTicketList from '../Support/AdminTicketList';
import TicketList from '../Support/TicketList';
import AgenteTicketList from '../Support/AgenteTicketList';

const ChatWindow = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const isAgent = user?.isAgente === true;

    const renderTicketList = () => {
        if (isAdmin) return <AdminTicketList />;
        if (isAgent) return <AgenteTicketList />;
        return <TicketList />;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                {renderTicketList()}
            </Paper>
        </Container>
    );
};

export default ChatWindow;