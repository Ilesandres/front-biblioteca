import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Paper,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { Download, Upload, ImportExport } from '@mui/icons-material';
import templateService from '../../services/template.service';

const TemplateManager = () => {
    const [selectedEntity, setSelectedEntity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [exportFormat, setExportFormat] = useState('excel');

    const entities = [
        { value: 'books', label: 'Libros' },
        { value: 'users', label: 'Usuarios' },
        { value: 'loans', label: 'Préstamos' },
        { value: 'reviews', label: 'Reseñas' },
        { value: 'categories', label: 'Categorías' },
        { value: 'bookcategories', label: 'Libro-Categoría' }
    ];

    const exportFormats = [
        { value: 'excel', label: 'Excel (.xlsx)' },
        { value: 'pdf', label: 'PDF (.pdf)' },
        { value: 'csv', label: 'CSV (.csv)' },
        { value: 'sql', label: 'SQL (.sql)' }
    ];

    const handleDownloadTemplate = async () => {
        if (!selectedEntity) {
            setError('Por favor seleccione un tipo de entidad');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await templateService.downloadTemplate(selectedEntity);
            setSuccess('Plantilla descargada exitosamente');
        } catch (error) {
            setError('Error al descargar la plantilla: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
    };

    const handleImport = async () => {
        if (!selectedFile || !selectedEntity) {
            setError('Por favor seleccione un archivo y un tipo de entidad');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await templateService.importData(selectedFile, [selectedEntity]);
            setSuccess('Datos importados exitosamente');
            setSelectedFile(null);
        } catch (error) {
            setError('Error al importar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedEntity) {
            setError('Por favor seleccione un tipo de entidad');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await templateService.exportData([selectedEntity], exportFormat);
            setSuccess('Datos exportados exitosamente');
        } catch (error) {
            setError('Error al exportar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Typography variant="h5" gutterBottom>
                Gestión de Datos
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Tipo de Entidad</InputLabel>
                        <Select
                            value={selectedEntity}
                            label="Tipo de Entidad"
                            onChange={(e) => setSelectedEntity(e.target.value)}
                        >
                            {entities.map((entity) => (
                                <MenuItem key={entity.value} value={entity.value}>
                                    {entity.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Formato de Exportación</InputLabel>
                        <Select
                            value={exportFormat}
                            label="Formato de Exportación"
                            onChange={(e) => setExportFormat(e.target.value)}
                        >
                            {exportFormats.map((format) => (
                                <MenuItem key={format.value} value={format.value}>
                                    {format.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            onClick={handleDownloadTemplate}
                            disabled={loading}
                        >
                            Descargar Plantilla
                        </Button>

                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<Upload />}
                            disabled={loading}
                        >
                            Seleccionar Archivo
                            <input
                                type="file"
                                hidden
                                accept=".xlsx,.xls,.json"
                                onChange={handleFileChange}
                            />
                        </Button>

                        {selectedFile && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleImport}
                                disabled={loading}
                            >
                                Importar
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            startIcon={<ImportExport />}
                            onClick={handleExport}
                            disabled={loading}
                        >
                            Exportar
                        </Button>
                    </Box>
                </Grid>

                {loading && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
                    </Grid>
                )}

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}

                {success && (
                    <Grid item xs={12}>
                        <Alert severity="success">{success}</Alert>
                    </Grid>
                )}

                {selectedFile && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                            Archivo seleccionado: {selectedFile.name}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default TemplateManager;