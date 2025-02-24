import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Box,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    Book as BookIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import bookService from '../../services/book.service';

const BookCard = ({ book, onUpdate }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
            try {
                await bookService.delete(book.id);
                onUpdate(); // Recargar la lista de libros
            } catch (error) {
                console.error('Error al eliminar el libro:', error);
            }
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="200"
                image={book.portada || '/default-book-cover.jpg'}
                alt={book.titulo}
                sx={{ objectFit: 'contain', p: 1 }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {book.titulo} 
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {book.autor}
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                    {book.categorias && (
                        <Chip 
                            label={book.categorias}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    <Chip
                        label={book.disponible ? 'Disponible' : 'No disponible'}
                        size="small"
                        color="primary"
                        sx={{ opacity: book.disponible ? 1 : 0.6 }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {book.descripcion && (book.descripcion.length > 100 
                        ? `${book.descripcion.substring(0, 100)}...` 
                        : book.descripcion)}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                    <Tooltip title="Ver detalles">
                        <IconButton
                            onClick={() => navigate(`/books/${book.id}`)}
                            color="primary"
                        >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                    {book.disponible && (
                        <Tooltip title="Solicitar préstamo">
                            <IconButton
                                onClick={() => navigate(`/loans/new/${book.id}`)}
                                color="secondary"
                            >
                                <BookIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {isAdmin && (
                    <Box>
                        <Tooltip title="Editar">
                            <IconButton
                                onClick={() => navigate(`/books/edit/${book.id}`)}
                                color="primary"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton
                                onClick={handleDelete}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </CardActions>
        </Card>
    );
};

export default BookCard;