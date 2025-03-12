import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import supportService from '../../services/support.service';
import adminService from '../../services/admin.service';

const AgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Cargar agentes actuales (solo los que están en la tabla support_agent)
            const { agentes } = await supportService.getAgentes();
            setAgents(agentes);
            
            // Cargar todos los usuarios que no son agentes ni admin
            const response = await adminService.getUsers();
            const regularUsers = (response || []).filter(user => 
                user.rol === 'usuario' && !agentes.some(agent => agent.id === user.id)
            );
            setUsers(regularUsers);
        } catch (error) {
            setError('Error al cargar los datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAgent = async (user) => {
        try {
            await supportService.createAgente(user.id);
            await loadData();
            setError('');
        } catch (error) {
            setError(error.response?.data?.error || 'Error al convertir el usuario en agente');
            console.error(error);
        }
    };

    const handleRemoveAgent = async (agentId) => {
        if (window.confirm('¿Estás seguro de que deseas quitar este agente?')) {
            try {
                await supportService.removeAgente(agentId);
                await loadData();
                setError('');
            } catch (error) {
                setError(error.response?.data?.error || 'Error al quitar el agente');
                console.error(error);
            }
        }
    };

    const handleUpdateStatus = async (agentId, newStatus) => {
        try {
            await supportService.updateAgenteEstado(agentId, newStatus);
            await loadData();
            setError('');
        } catch (error) {
            setError(error.response?.data?.error || 'Error al actualizar el estado del agente');
            console.error(error);
        }
    };

    const getStatusColor = (estado) => {
        const colors = {
            disponible: 'success',
            ocupado: 'warning',
            offline: 'default'
        };
        return colors[estado] || 'default';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Agentes de Soporte
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {agents.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell>{agent.nombre || '-'}</TableCell>
                                    <TableCell>{agent.email}</TableCell>
                                    <TableCell>
                                        <FormControl size="small">
                                            <Select
                                                value={agent.estado || 'offline'}
                                                onChange={(e) => handleUpdateStatus(agent.id, e.target.value)}
                                                size="small"
                                                sx={{ minWidth: 120 }}
                                            >
                                                <MenuItem value="disponible">Disponible</MenuItem>
                                                <MenuItem value="ocupado">Ocupado</MenuItem>
                                                <MenuItem value="offline">Offline</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            onClick={() => handleRemoveAgent(agent.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {agents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No hay agentes de soporte registrados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Usuarios Disponibles
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.nombre || '-'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            startIcon={<PersonAddIcon />}
                                            onClick={() => handleMakeAgent(user)}
                                            size="small"
                                        >
                                            Hacer Agente
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No hay usuarios disponibles para convertir en agentes
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default AgentManagement; 