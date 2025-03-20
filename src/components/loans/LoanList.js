import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { History as HistoryIcon, Update as UpdateIcon } from '@mui/icons-material';
import loanService from '../../services/loan.service';
import { useGlobalNotification } from '../GlobalNotification';

const getStatusColor = (estado) => {
    switch (estado) {
        case 'activo':
            return 'primary';
        case 'atrasado':
            return 'error';
        case 'devuelto':
            return 'success';
        default:
            return 'default';
    }
};

const LoanList = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const showTipeNotification=useGlobalNotification();

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            setLoading(true);
            const response = await loanService.getUserLoans();
            setLoans(await response || []); // Initialize as empty array if response is undefined
            setError('');
        } catch (err) {
            setError('Error al cargar los préstamos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        try {
            await loanService.return(id);
            loadLoans();
            showTipeNotification.success('libro devuelto')

        } catch (err) {
            setError('Error al devolver el libro');
            showTipeNotification.error('Error al devolver el libro')
        
        }
    };

    const handleExtend = async (id) => {
        try {
            await loanService.extend(id);
            loadLoans();
            //showTipeNotification.info('operacion exitosa')
        } catch (err) {
            setError('Error al extender el préstamo');
            showTipeNotification.error('Error al extender el préstamo')
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Mis Préstamos
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loans.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No tienes préstamos activos
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Libro</TableCell>
                                <TableCell>Fecha Préstamo</TableCell>
                                <TableCell>Fecha Devolución</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loans.map((loan) => (
                                <TableRow key={loan.id}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                component="img"
                                                src={loan.libro_Portada || '/default-book-cover.jpg'}
                                                alt={loan.libro_titulo || 'Portada del libro'}
                                                sx={{ width: 50, height: 70, objectFit: 'cover' }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {loan.libro_titulo || 'Sin título'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {loan.libro_autor || 'Autor desconocido'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(loan.fechaPrestamo).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {loan.fechaDevolucion ? new Date(loan.fechaDevolucion).toLocaleDateString() : 'Pendiente'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={loan.estado_prestamo || 'activo'}
                                            color={getStatusColor(loan.estado_prestamo || 'activo')}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {(!loan.fechaDevolucion || loan.estado_prestamo === 'prestado') && (
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    startIcon={<HistoryIcon />}
                                                    onClick={() => handleReturn(loan.id)}
                                                >
                                                    Devolver
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<UpdateIcon />}
                                                    onClick={() => handleExtend(loan.id)}
                                                >
                                                    Extender
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default LoanList;