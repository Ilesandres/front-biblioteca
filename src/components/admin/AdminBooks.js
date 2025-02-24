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
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import adminService from '../../services/admin.service';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await adminService.getBooks();
            setBooks(response);
        } catch (err) {
            setError('Error al cargar los libros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = () => {
        setSelectedBook(null);
        setOpenDialog(true);
    };

    const handleEditBook = (book) => {
        setSelectedBook(book);
        setOpenDialog(true);
    };

    const handleSaveBook = async (bookData) => {
        try {
            if (selectedBook) {
                await adminService.updateBook(selectedBook.id, bookData);
                setSnackbar({ open: true, message: 'Libro actualizado exitosamente', severity: 'success' });
            } else {
                await adminService.createBook(bookData);
                setSnackbar({ open: true, message: 'Libro creado exitosamente', severity: 'success' });
            }
            loadBooks();
            setOpenDialog(false);
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al guardar el libro', severity: 'error' });
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            await adminService.deleteBook(bookId);
            setSnackbar({ open: true, message: 'Libro eliminado exitosamente', severity: 'success' });
            loadBooks();
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al eliminar el libro', severity: 'error' });
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">
                    Gestión de Libros
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddBook}
                >
                    Agregar Libro
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Título</TableCell>
                            <TableCell>Autor</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books.map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>{book.id}</TableCell>
                                <TableCell>{book.titulo}</TableCell>
                                <TableCell>{book.autor}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.estado}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEditBook(book)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteBook(book.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {selectedBook ? 'Editar Libro' : 'Agregar Libro'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Título"
                            name="titulo"
                            defaultValue={selectedBook?.titulo || ''}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="ISBN"
                            name="isbn"
                            defaultValue={selectedBook?.isbn || ''}
                            margin="normal"
                            required
                            helperText="Identificador único del libro (ISBN-10 o ISBN-13)"
                        />
                        <TextField
                            fullWidth
                            label="Autor"
                            name="autor"
                            defaultValue={selectedBook?.autor || ''}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            name="descripcion"
                            multiline
                            rows={4}
                            defaultValue={selectedBook?.descripcion || ''}
                            margin="normal"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={() => handleSaveBook(selectedBook)} color="primary">
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

export default AdminBooks;