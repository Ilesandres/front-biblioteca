import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    MenuItem,
    Grid,
    Alert,
    IconButton
} from '@mui/material';
import { PhotoCamera, ArrowBack } from '@mui/icons-material';
import { GENEROS } from './BookFilters';
import bookService from '../../services/book.service';

const validationSchema = Yup.object({
    titulo: Yup.string()
        .required('El título es requerido')
        .min(2, 'El título debe tener al menos 2 caracteres'),
    autor: Yup.string()
        .required('El autor es requerido')
        .min(2, 'El autor debe tener al menos 2 caracteres'),
    descripcion: Yup.string()
        .required('La descripción es requerida')
        .min(10, 'La descripción debe tener al menos 10 caracteres'),
    genero: Yup.string()
        .required('El género es requerido'),
    fechaPublicacion: Yup.date()
        .required('La fecha de publicación es requerida'),
    copias: Yup.number()
        .required('El número de copias es requerido')
        .min(1, 'Debe haber al menos 1 copia')
});

const BookForm = ({ mode = 'create', initialData = null }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const formik = useFormik({
        initialValues: {
            titulo: initialData?.titulo || '',
            autor: initialData?.autor || '',
            descripcion: initialData?.descripcion || '',
            genero: initialData?.genero || '',
            fechaPublicacion: initialData?.fechaPublicacion ? new Date(initialData.fechaPublicacion).toISOString().split('T')[0] : '',
            copias: initialData?.copias || 1,
            portada: null
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setError('');
                const formData = new FormData();
                
                // Append form fields
                Object.keys(values).forEach(key => {
                    if (key !== 'portada' && values[key] !== null && values[key] !== undefined) {
                        // Only apply trim() to string values
                        const value = typeof values[key] === 'string' ? values[key].trim() : values[key];
                        formData.append(key, value);
                    }
                });
                
                // Handle image file separately
                if (values.portada instanceof File) {
                    if (values.portada.size > 5 * 1024 * 1024) { // 5MB limit
                        setError('La imagen no debe superar los 5MB');
                        return;
                    }
                    if (!values.portada.type.startsWith('image/')) {
                        setError('El archivo debe ser una imagen');
                        return;
                    }
                    formData.append('portada', values.portada);
                }
                
                if (mode === 'create') {
                    await bookService.create(formData);
                } else {
                    await bookService.update(id, formData);
                }
                
                navigate('/');
            } catch (err) {
                console.error('Error details:', err);
                setError(err.response?.data?.message || 'Error al guardar el libro. Por favor, verifica los datos e intenta nuevamente.');
            }
        },
    });

    useEffect(() => {
        if (initialData?.portada) {
            setPreviewUrl(`/uploads/${initialData.portada}`);
        }
    }, [initialData]);
    useEffect(() => {
        const loadBookData = async () => {
            if (mode === 'edit' && id) {
                setLoading(true);
                try {
                    const data = await bookService.getById(id);
                    console.log(data);
                    console.log(data.fechaPublicacion);
                    formik.setValues({
                        titulo: data.data.titulo || '',
                        autor: data.data.autor || '',
                        descripcion: data.data.descripcion || '',
                        genero: data.data.genero || '',
                        fechaPublicacion: data.data.fechaPublicacion ? new Date(data.data.fechaPublicacion).toISOString().split('T')[0] : '',
                        copias: data.data.copias || 1,
                        portada: null
                    });
                    if (data.data.portada) {
                        setPreviewUrl(`/uploads/${data.data.portada}`);
                    }
                } catch (err) {
                    setError('Error al cargar los datos del libro');
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBookData();
    }, [id, mode]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            formik.setFieldValue('portada', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Cargando...</Typography>
            </Box>
        );
    }
    const renderImageUpload = () => (
        <Box sx={{ mt: 2, mb: 2 }}>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="portada-upload"
                type="file"
                onChange={handleImageChange}
            />
            <label htmlFor="portada-upload">
                <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                >
                    Subir Portada
                </Button>
            </label>
            {previewUrl && (
                <Box sx={{ mt: 2 }}>
                    <img
                        src={previewUrl}
                        alt="Vista previa de la portada"
                        style={{ maxWidth: '200px', maxHeight: '300px' }}
                    />
                </Box>
            )}
        </Box>
    );
    return (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h5">
                    {mode === 'create' ? 'Agregar Nuevo Libro' : 'Editar Libro'}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            name="titulo"
                            label="Título"
                            value={formik.values.titulo}
                            onChange={formik.handleChange}
                            error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                            helperText={formik.touched.titulo && formik.errors.titulo}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            name="autor"
                            label="Autor"
                            value={formik.values.autor}
                            onChange={formik.handleChange}
                            error={formik.touched.autor && Boolean(formik.errors.autor)}
                            helperText={formik.touched.autor && formik.errors.autor}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            name="descripcion"
                            label="Descripción"
                            multiline
                            rows={4}
                            value={formik.values.descripcion}
                            onChange={formik.handleChange}
                            error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                            helperText={formik.touched.descripcion && formik.errors.descripcion}
                            margin="normal"
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                width: '100%',
                                height: 200,
                                border: '1px dashed grey',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                mb: 2,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Vista previa"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary' }} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            name="genero"
                            label="Género"
                            value={formik.values.genero}
                            onChange={formik.handleChange}
                            error={formik.touched.genero && Boolean(formik.errors.genero)}
                            helperText={formik.touched.genero && formik.errors.genero}
                            margin="normal"
                        >
                            {GENEROS.map((genero) => (
                                <MenuItem key={genero} value={genero}>
                                    {genero}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            name="fechaPublicacion"
                            label="Fecha de Publicación"
                            value={formik.values.fechaPublicacion}
                            onChange={formik.handleChange}
                            error={formik.touched.fechaPublicacion && Boolean(formik.errors.fechaPublicacion)}
                            helperText={formik.touched.fechaPublicacion && formik.errors.fechaPublicacion}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            name="copias"
                            label="Número de Copias"
                            value={formik.values.copias}
                            onChange={formik.handleChange}
                            error={formik.touched.copias && Boolean(formik.errors.copias)}
                            helperText={formik.touched.copias && formik.errors.copias}
                            margin="normal"
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </Grid>

                    <Grid item xs={12}>
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
                                color="primary"
                            >
                                {mode === 'create' ? 'Crear Libro' : 'Guardar Cambios'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default BookForm;