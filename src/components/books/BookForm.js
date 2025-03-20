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
    IconButton,
    Snackbar
} from '@mui/material';
import { PhotoCamera, ArrowBack } from '@mui/icons-material';
import libroService from '../../services/libroService';
import genreService from '../../services/genre.service';
import { useNotification } from '../../context/NotificationContext';

const validationSchema = Yup.object({
    titulo: Yup.string()
        .required('El título es requerido')
        .min(2, 'El título debe tener al menos 2 caracteres'),
    isbn: Yup.string()
        .required('El ISBN es requerido')
        .matches(/^\d{13}$/, 'El ISBN debe ser un número de 13 dígitos. Por favor, ingrese solo los números sin guiones ni espacios'),
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
        .min(1, 'Debe haber al menos 1 copia'),
    stock: Yup.number()
        .required('El stock es requerido')
        .min(0, 'El stock no puede ser negativo'),
    editorial: Yup.string()
        .required('La editorial es requerida')
        .min(2, 'La editorial debe tener al menos 2 caracteres')
});

const BookForm = ({ mode = 'create', initialData = null }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [genres, setGenres] = useState([]);
    const { showNotification } = useNotification();

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genreData = await genreService.getAllGenres();
                setGenres(genreData);
            } catch (error) {
                console.error('Error loading genres:', error);
                setError('Error loading genres');
            }
        };
        loadGenres();
    }, []);

    const formik = useFormik({
        initialValues: {
            titulo: initialData?.titulo || '',
            isbn: initialData?.isbn || '',
            autor: initialData?.autor || '',
            descripcion: initialData?.descripcion || '',
            genero: initialData?.genero || '',
            fechaPublicacion: initialData?.fechaPublicacion ? new Date(initialData.fechaPublicacion).toISOString().split('T')[0] : '',
            copias: initialData?.copias || 1,
            stock: initialData?.copias || 1,
            editorial: initialData?.editorial || '',
            portada: null
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setError('');
                setLoading(true);
                const formData = new FormData();
                
                // Add all form fields to FormData
                Object.keys(values).forEach(key => {
                    if (values[key] !== null && values[key] !== undefined && key !== 'portada') {
                        formData.append(key, values[key]);
                    }
                });
                formData.append('anioPublicacion', values.fechaPublicacion);
                
                // Handle image upload
                if (values.portada instanceof File) {
                    formData.append('portada', values.portada);
                } else if (mode === 'edit' && previewUrl) {
                    formData.append('portadaActual', previewUrl);
                }

                if (mode === 'create') {
                    if (!values.portada) {
                        showNotification({
                            message: 'Debes seleccionar una imagen para la portada',
                            severity: 'error'
                        });
                        setLoading(false);
                        return;
                    }
                    await libroService.crearLibro(formData);
                } else if (mode === 'edit' && id) {
                    await libroService.updateLibro(id, formData);
                }
                
                setLoading(false);
                showNotification({
                    message: mode === 'create' ? 'Libro creado exitosamente' : 'Libro actualizado exitosamente',
                    severity: 'success'
                });
                navigate('/');
            } catch (err) {
                console.error('Error details:', err);
                setLoading(false);
                const errorMessage = err?.response?.data?.error?.message || 'Error al guardar el libro. Por favor, verifica los datos e intenta nuevamente.';
                setError(errorMessage);
                showNotification({
                    message: errorMessage,
                    severity: 'error'
                });
            }
        },
    });

    useEffect(() => {
        if (initialData?.portada) {
            // Check if the portada URL is already a full URL (Cloudinary)
            if (initialData.portada.startsWith('http')) {
                setPreviewUrl(initialData.portada);
            } else {
                setPreviewUrl(`${process.env.REACT_APP_API_URL}/uploads/${initialData.portada}`);
            }
        }
    }, [initialData]);
    useEffect(() => {
        const loadBookData = async () => {
            if (mode === 'edit' && id) {
                setLoading(true);
                try {
                    const data1 = await libroService.getLibroById(id);
                    const data=data1;
                    formik.setValues({
                        titulo: data.titulo || '',
                        autor: data.autor || '',
                        isbn: data.isbn || '',
                        descripcion: data.descripcion || '',
                        genero: data.categoriaIds || '',
                        fechaPublicacion: data.anioPublicacion ? new Date(data.anioPublicacion).toISOString().split('T')[0] : '',
                        copias: data.stock || 1,
                        stock: data.stock || 1,
                        editorial: data.editorial || '',
                        portada: null
                    });
                    if (data.portada) {
                        // Check if the portada URL is already a full URL (Cloudinary)
                        if (data.portada.startsWith('http')) {
                            setPreviewUrl(data.portada);
                        } else {
                            setPreviewUrl(`${process.env.REACT_APP_API_URL}/uploads/${data.portada}`);
                        }
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
            console.log('Nueva imagen detectada:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            formik.setFieldValue('portada', file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            console.log('No se seleccionó ninguna imagen');
            formik.setFieldValue('portada', null);
            setPreviewUrl('');
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
        <>
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
                            helperText={(formik.touched.titulo && formik.errors.titulo) || 'Ingrese el título completo del libro'}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            name="isbn"
                            label="ISBN"
                            value={formik.values.isbn}
                            onChange={formik.handleChange}
                            error={formik.touched.isbn && Boolean(formik.errors.isbn)}
                            helperText={(formik.touched.isbn && formik.errors.isbn) || 'Ingrese el ISBN-10 o ISBN-13 del libro (ejemplo: 978-3-16-148410-0)'}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            name="autor"
                            label="Autor"
                            value={formik.values.autor}
                            onChange={formik.handleChange}
                            error={formik.touched.autor && Boolean(formik.errors.autor)}
                            helperText={(formik.touched.autor && formik.errors.autor) || 'Ingrese el nombre completo del autor'}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="descripcion"
                            label="Descripción"
                            value={formik.values.descripcion}
                            onChange={formik.handleChange}
                            error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                            helperText={(formik.touched.descripcion && formik.errors.descripcion) || 'Ingrese una descripción detallada del libro'}
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
                            helperText={(formik.touched.genero && formik.errors.genero) || 'Seleccione el género literario del libro'}
                            margin="normal"
                        >
                            {genres.map((genero) => (
                                <MenuItem key={genero.id} value={genero.id}>
                                    {genero.nombre}
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
                            helperText={(formik.touched.fechaPublicacion && formik.errors.fechaPublicacion) || 'Seleccione la fecha de publicación del libro'}
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
                            helperText={(formik.touched.copias && formik.errors.copias) || 'Indique la cantidad de copias disponibles'}
                            margin="normal"
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="editorial"
                            label="Editorial"
                            value={formik.values.editorial}
                            onChange={formik.handleChange}
                            error={formik.touched.editorial && Boolean(formik.errors.editorial)}
                            helperText={(formik.touched.editorial && formik.errors.editorial) || 'Ingrese el nombre de la editorial'}
                            margin="normal"
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

        </>
    );
};

export default BookForm;