import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    Grid,
    TextField,
    Container,
    IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import libroService from '../../services/libroService';
import loanService from '../../services/loan.service';

const validationSchema = Yup.object({
    fechaDevolucion: Yup.date()
        .required('La fecha de devolución es requerida')
        .min(new Date(), 'La fecha debe ser posterior a hoy')
});

const LoanForm = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBook();
    }, [bookId]);

    const loadBook = async () => {
        try {
            const response = await libroService.getLibroById(bookId);
            setBook(response);
            if (!response.disponible) {
                setError('Este libro no está disponible para préstamo');
            }
        } catch (err) {
            setError('Error al cargar la información del libro');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            fechaDevolucion: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await loanService.create({
                    libroId: bookId,
                    fechaDevolucion: values.fechaDevolucion
                });
                navigate('/loans');
            } catch (err) {
                setError(err.response?.data?.message || 'Error al crear el préstamo');
            }
        }
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5">
                        Solicitar Préstamo
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {book && (
                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} md={4}>
                            <Box
                                component="img"
                                src={book.portada || '/default-book-cover.jpg'}
                                alt={book.titulo}
                                sx={{
                                    width: '100%',
                                    maxHeight: 200,
                                    objectFit: 'contain'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6">{book.titulo}</Typography>
                            <Typography color="text.secondary">
                                {book.autor}
                            </Typography>
                        </Grid>
                    </Grid>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        type="date"
                        name="fechaDevolucion"
                        label="Fecha de Devolución"
                        value={formik.values.fechaDevolucion}
                        onChange={formik.handleChange}
                        error={formik.touched.fechaDevolucion && Boolean(formik.errors.fechaDevolucion)}
                        helperText={formik.touched.fechaDevolucion && formik.errors.fechaDevolucion}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 3 }}
                    />

                    <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={!formik.isValid || formik.isSubmitting || !book?.disponible}
                        >
                            Solicitar Préstamo
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default LoanForm;