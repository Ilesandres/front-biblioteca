import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import adminService from '../../services/admin.service';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers();
            setUsers(response || []);
        } catch (err) {
            setError('Error al cargar los usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleUpdateUser = async (userId, updatedData) => {
        try {
            await adminService.updateUser(userId, updatedData);
            setSnackbar({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' });
            loadUsers();
            setOpenDialog(false);
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al actualizar usuario', severity: 'error' });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
            await adminService.updateUserStatus(userId, newStatus);
            setSnackbar({ open: true, message: 'Estado del usuario actualizado', severity: 'success' });
            loadUsers();
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al actualizar estado', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Gestión de Usuarios
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.nombre}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.rol}</TableCell>
                                <TableCell>{user.estado}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEditUser(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleToggleStatus(user.id, user.estado)}>
                                        {user.estado === 'activo' ? <BlockIcon /> : <CheckCircleIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                defaultValue={selectedUser.nombre}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                defaultValue={selectedUser.email}
                                margin="normal"
                            />
                            <TextField
                                select
                                fullWidth
                                label="Rol"
                                defaultValue={selectedUser.rol}
                                margin="normal"
                            >
                                <MenuItem value="usuario">Usuario</MenuItem>
                                <MenuItem value="admin">Administrador</MenuItem>
                            </TextField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={() => handleUpdateUser(selectedUser.id, selectedUser)} color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminUsers;