import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Grid,
    Typography,
    Box,
    Button,
    Divider,
    Rating,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    ArrowBack,
    Book as BookIcon,
    Star as StarIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import bookService from '../../services/book.service';
import ReviewList from '../reviews/ReviewList';
import ReviewForm from '../reviews/ReviewForm';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        loadBook();
    }, [id]);

    const loadBook = async () => {
        try {
            setLoading(true);
            const response = await bookService.getById(id);
            setBook(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar el libro');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestLoan = () => {
        navigate(`/loans/new/${id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !book) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error || 'No se encontró el libro'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box
                            component="img"
                            src={book.portada || '/default-book-cover.jpg'}
                            alt={book.titulo}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 400,
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" gutterBottom>
                            {book.titulo}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {book.autor}
                        </Typography>

                        <Box display="flex" gap={1} mb={2}>
                            <Chip label={book.genero} color="primary" variant="outlined" />
                            <Chip
                                label={book.disponible ? 'Disponible' : 'No disponible'}
                                color={book.disponible ? 'success' : 'error'}
                            />
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                            <Rating
                                value={book.calificacionPromedio || 0}
                                readOnly
                                precision={0.5}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({book.numeroResenas || 0} reseñas)
                            </Typography>
                        </Box>

                        <Typography variant="body1" paragraph>
                            {book.descripcion}
                        </Typography>

                        <Box display="flex" gap={2} mt={3}>
                            {book.disponible && (
                                <Button
                                    variant="contained"
                                    startIcon={<BookIcon />}
                                    onClick={handleRequestLoan}
                                >
                                    Solicitar Préstamo
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                startIcon={<StarIcon />}
                                onClick={() => setShowReviewForm(true)}
                            >
                                Escribir Reseña
                            </Button>
                            {user?.role === 'admin' && (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => navigate(`/books/edit/${id}`)}
                                >
                                    Editar Libro
                                </Button>
                            )}
                        </Box>
                        <Box mt={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Fecha de publicación: {new Date(book.fechaPublicacion).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Copias disponibles: {book.copias}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ my: 4 }} />

            {showReviewForm && (
                <ReviewForm
                    bookId={id}
                    onSubmit={() => {
                        setShowReviewForm(false);
                        loadBook();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    Reseñas
                </Typography>
                <ReviewList bookId={id} onReviewUpdated={loadBook} />
            </Box>
        </Container>
    );
};

export default BookDetail;