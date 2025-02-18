import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';
import BookForm from '../components/books/BookForm';
import bookService from '../services/book.service';

const BookManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadBook();
        }
    }, [id]);

    const loadBook = async () => {
        try {
            const response = await bookService.getById(id);
            if (response.success) {
                // Format the date to YYYY-MM-DD for the form input
                const formattedBook = {
                    ...response.data,
                    fechaPublicacion: response.data.fechaPublicacion 
                        ? new Date(response.data.fechaPublicacion).toISOString().split('T')[0]
                        : ''
                };
                setBook(formattedBook);
            } else {
                setError('No se pudo cargar el libro');
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar el libro');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <BookForm 
                initialValues={book} 
                mode={id ? 'edit' : 'create'} 
            />
        </Container>
    );
};

export default BookManagement;