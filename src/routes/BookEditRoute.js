import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import BookForm from '../components/books/BookForm';
import bookService from '../services/book.service';
import { useAuth } from '../components/auth/AuthContext';

const BookEditRoute = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.rol === 'admin') {
            navigate('/');
            return;
        }

        const loadBook = async () => {
            try {
                setLoading(true);
                const response = await bookService.getById(id);
                if (response.data) {
                    setBook(response.data.data);
                    setError('');
                } else {
                    setError('No se encontró el libro');
                }
            } catch (err) {
                setError('Error al cargar el libro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadBook();
    }, [id, navigate, user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !book) {
        return (
            <Box mt={4}>
                <Alert severity="error">
                    {error || 'No se encontró el libro'}
                </Alert>
            </Box>
        );
    }

    return <BookForm initialValues={book} mode="edit" />;
};

export default BookEditRoute;