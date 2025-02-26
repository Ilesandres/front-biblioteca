import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Box,
    Rating,
    Typography,
    Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import reviewService from '../../services/review.service';

const validationSchema = Yup.object({
    calificacion: Yup.number()
        .required('La calificación es requerida')
        .min(1, 'La calificación mínima es 1')
        .max(5, 'La calificación máxima es 5'),
    comentario: Yup.string()
        .required('El comentario es requerido')
        .min(10, 'El comentario debe tener al menos 10 caracteres')
        .max(1000, 'El comentario no puede exceder los 1000 caracteres')
});

const ReviewForm = ({ bookId, onSubmit, onCancel, initialValues = null }) => {
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: initialValues || {
            calificacion: 3,
            comentario: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (!values.calificacion) {
                    setError('Por favor, selecciona una calificación');
                    return;
                }
                if (initialValues) {
                    await reviewService.update(initialValues.id, values);
                } else {
                    await reviewService.create({ ...values, libroId: bookId });
                }
                onSubmit();
            } catch (err) {
                console.error('Error details:', err);
                setError(err.response?.data?.error || 'Error al guardar la reseña');
            }
        }
    });

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {initialValues ? 'Editar Reseña' : 'Escribir Reseña'}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Box mb={2}>
                    <Typography component="legend">Calificación</Typography>
                    <Rating
                        name="calificacion"
                        value={formik.values.calificacion}
                        onChange={(_, value) => {
                            formik.setFieldValue('calificacion', value);
                        }}
                    />
                    {formik.touched.calificacion && formik.errors.calificacion && (
                        <Typography color="error" variant="caption">
                            {formik.errors.calificacion}
                        </Typography>
                    )}
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="comentario"
                    label="Comentario"
                    value={formik.values.comentario}
                    onChange={formik.handleChange}
                    error={formik.touched.comentario && Boolean(formik.errors.comentario)}
                    helperText={formik.touched.comentario && formik.errors.comentario}
                    margin="normal"
                />

                <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button variant="outlined" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={!formik.isValid || formik.isSubmitting}
                    >
                        {initialValues ? 'Actualizar' : 'Publicar'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default ReviewForm;