import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert } from '@mui/material';
import BookForm from '../components/books/BookForm';
import bookService from '../services/book.service';

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBook = async () => {
            try {
                setLoading(true);
                const response = await bookService.getById(id);
                const bookData = response.data;
                // Format the date to YYYY-MM-DD for the form
                if (bookData.fechaPublicacion) {
                    bookData.fechaPublicacion = new Date(bookData.fechaPublicacion)
                        .toISOString().split('T')[0];
                }
                setBook(bookData);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar el libro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadBook();
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return <BookForm mode="edit" initialData={book} />;
};

export default EditBook;