import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Pagination,
    Paper,
    Card,
    Divider,
    Chip,
    useTheme,
    Fade
} from '@mui/material';
import { 
    Add as AddIcon,
    LibraryBooks as LibraryIcon,
    SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import libroService from '../../services/libroService';
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
    const theme = useTheme();

    const loadBooks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await libroService.getLibros({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            
            // Update to handle direct array response from backend
            const booksData = Array.isArray(response) ? response : response.data;
            setBooks(booksData);
            setPagination(prev => ({
                ...prev,
                totalPages: Math.ceil(booksData.length / pagination.limit),
                totalItems: booksData.length
            }));
            setError('');
        } catch (err) {
            setError('Error al cargar los libros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary" mt={3}>
                    Cargando libros...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%' }}>
            <Card 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    backgroundImage: 'linear-gradient(120deg, #1976d2, #304FFE)'
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <LibraryIcon sx={{ mr: 2, fontSize: 35 }} />
                        Biblioteca
                    </Typography>
                    {user?.rol === 'admin' && (
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/books/new')}
                            sx={{ 
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                boxShadow: 3,
                                backgroundColor: 'white',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                }
                            }}
                        >
                            Agregar Libro
                        </Button>
                    )}
                </Box>
                
                <Box sx={{ mt: 2 }}>
                    <Chip 
                        label={`${books.length} libros disponibles`} 
                        size="small" 
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontWeight: 500
                        }} 
                    />
                </Box>
            </Card>

            <Card elevation={2} sx={{ borderRadius: 2, mb: 4, overflow: 'visible' }}>
                <Box p={3}>
                    <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                        Filtros de búsqueda
                    </Typography>
                    <BookFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </Box>
            </Card>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: 1
                    }}
                    variant="filled"
                >
                    {error}
                </Alert>
            )}

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress size={30} />
                </Box>
            )}

            <Fade in={!loading || books.length > 0}>
                <Grid container spacing={3}>
                    {books.map((book, index) => (
                        <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                            <Fade in={true} timeout={300 + (index % 12) * 100}>
                                <div>
                                    <BookCard book={book} onUpdate={loadBooks} />
                                </div>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            </Fade>

            {books.length === 0 && !loading && (
                <Card 
                    elevation={1} 
                    sx={{ 
                        textAlign: 'center', 
                        py: 5, 
                        px: 2,
                        borderRadius: 2,
                        backgroundColor: '#f9f9f9',
                        border: '1px dashed #ccc'
                    }}
                >
                    <SearchOffIcon sx={{ fontSize: 70, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No se encontraron libros
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Intenta modificar los filtros de búsqueda o consulta más tarde
                    </Typography>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mt: 3, borderRadius: 2 }}
                        onClick={handleClearFilters}
                    >
                        Limpiar filtros
                    </Button>
                </Card>
            )}

            {pagination.totalPages > 1 && (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    mt={6}
                    mb={2}
                    sx={{
                        '& .MuiPagination-ul': {
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 500
                            }
                        }
                    }}
                >
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                    />
                </Box>
            )}
        </Box>
    );
};

export default BookList;