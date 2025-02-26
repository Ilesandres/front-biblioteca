import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    CircularProgress,
    Alert,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { API_URL } from '../config';
import axios from 'axios';

const ImportExport = () => {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedImportEntities, setSelectedImportEntities] = useState({
        books: true,
        users: true,
        loans: true,
        reviews: true,
        categories: true,
        bookCategories: true
    });
    const [selectedExportEntities, setSelectedExportEntities] = useState({
        books: true,
        users: true,
        loans: true,
        reviews: true,
        categories: true,
        bookCategories: true
    });

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setMessage({
                type: 'error',
                text: 'No se ha proporcionado ningún archivo'
            });
            return;
        }

        // Validate file type
        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'json'].includes(fileType)) {
            setMessage({
                type: 'error',
                text: 'Formato de archivo no soportado. Por favor, use archivos XLSX o JSON.'
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Get selected entities and validate
        const selectedEntities = Object.keys(selectedImportEntities)
            .filter(key => selectedImportEntities[key]);

        if (selectedEntities.length === 0) {
            setMessage({
                type: 'error',
                text: 'Por favor, seleccione al menos una entidad para importar.'
            });
            return;
        }

        formData.append('entities', JSON.stringify(selectedEntities));

        setImporting(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post(`${API_URL}/admin/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setMessage({
                type: 'success',
                text: 'Datos importados correctamente'
            });
        } catch (error) {
            console.error('Import error:', error);
            const errorMessage = error.response?.data?.error || error.message;
            setMessage({
                type: 'error',
                text: `Error al importar los datos: ${errorMessage}`
            });
        } finally {
            setImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleTemplateDownload = async (entity) => {
        try {
            const response = await axios.get(`${API_URL}/admin/template?entity=${entity}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${entity}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage({
                type: 'success',
                text: 'Plantilla descargada correctamente'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error al descargar la plantilla: ' + (error.response?.data?.message || error.message)
            });
        }
    };

    const handleExport = async (format) => {
        setExporting(true);
        setMessage({ type: '', text: '' });
    
        try {
            const entities = Object.keys(selectedExportEntities).filter(key => selectedExportEntities[key]);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/export`, {
                format,
                entities
            }, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            format=format==='excel'?'xlsx':format;
            link.setAttribute('download', `biblioteca_export.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage({
                type: 'success',
                text: 'Datos exportados correctamente'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error al exportar los datos: ' + (error.response?.data?.message || error.message)
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Importar/Exportar Datos
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Importar Datos
                        </Typography>
                        <FormGroup sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.books}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, books: e.target.checked }))}
                                />}
                                label="Libros"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.users}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, users: e.target.checked }))}
                                />}
                                label="Usuarios"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.loans}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, loans: e.target.checked }))}
                                />}
                                label="Préstamos"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.reviews}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, reviews: e.target.checked }))}
                                />}
                                label="Reseñas"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.categories}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, categories: e.target.checked }))}
                                />}
                                label="Categorías"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedImportEntities.bookCategories}
                                    onChange={(e) => setSelectedImportEntities(prev => ({ ...prev, bookCategories: e.target.checked }))}
                                />}
                                label="Relaciones Libro-Categoría"
                            />
                        </FormGroup>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Descargar Plantillas
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('books')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Libros
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('users')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Usuarios
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('loans')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Préstamos
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('reviews')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Reseñas
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('categories')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Categorías
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleTemplateDownload('bookcategories')}
                                    startIcon={<FileDownloadIcon />}
                                >
                                    Plantilla Libro-Categorías
                                </Button>
                            </Box>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.sql"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                                id="import-file"
                            />
                            <label htmlFor="import-file">
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<FileUploadIcon />}
                                    disabled={importing}
                                >
                                    {importing ? (
                                        <>
                                            <CircularProgress size={24} sx={{ mr: 1 }} />
                                            Importando...
                                        </>
                                    ) : (
                                        'Seleccionar Archivo'
                                    )}
                                </Button>
                            </label>
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                Formatos soportados: Excel (.xlsx, .xls), CSV, SQL
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Exportar Datos
                        </Typography>
                        <FormGroup sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.books}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, books: e.target.checked }))}
                                />}
                                label="Libros y Categorías"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.users}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, users: e.target.checked }))}
                                />}
                                label="Usuarios"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.loans}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, loans: e.target.checked }))}
                                />}
                                label="Préstamos"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.reviews}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, reviews: e.target.checked }))}
                                />}
                                label="Reseñas"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.categories}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, categories: e.target.checked }))}
                                />}
                                label="Categorías"
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={selectedExportEntities.bookCategories}
                                    onChange={(e) => setSelectedExportEntities(prev => ({ ...prev, bookCategories: e.target.checked }))}
                                />}
                                label="Relaciones Libro-Categoría"
                            />
                        </FormGroup>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExport('excel')}
                                disabled={exporting}
                            >
                                Exportar como Excel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExport('csv')}
                                disabled={exporting}
                            >
                                Exportar como CSV
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExport('pdf')}
                                disabled={exporting}
                            >
                                Exportar como PDF
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExport('sql')}
                                disabled={exporting}
                            >
                                Exportar como SQL
                            </Button>
                            {exporting && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={24} sx={{ mr: 1 }} />
                                    <Typography>Exportando...</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ImportExport;