import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import bookService from '../../services/book.service';
import BookCard from './BookCard';
import BookFilters from './BookFilters';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        genero: '',
        disponible: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 12
    });

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadBooks();
    }, [filters, pagination.page]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await bookService.getAll({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            
            setBooks(response.data);
            setPagination(prev => ({
                ...prev,
                totalPages: Math.ceil(response.total / pagination.limit),
                totalItems: response.total
            }));
            setError('');
        } catch (err) {
            setError('Error al cargar los libros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        setFilters({
            search: '',
            genero: '',
            disponible: ''
        });
    };

    const handlePageChange = (_, value) => {
        setPagination(prev => ({ ...prev, page: value }));
    };

    if (loading && !books.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Biblioteca
                </Typography>
                {user?.rol === 'admin' && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/books/new')}
                    >
                        Agregar Libro
                    </Button>
                )}
            </Box>

            <BookFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading && (
                <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress size={24} />
                </Box>
            )}

            <Grid container spacing={3}>
                {books.map((book) => (
                    <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                        <BookCard book={book} onUpdate={loadBooks} />
                    </Grid>
                ))}
            </Grid>

            {books.length === 0 && !loading && (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6" color="textSecondary">
                        No se encontraron libros
                    </Typography>
                </Box>
            )}

            {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Container>
    );
};

export default BookList; 