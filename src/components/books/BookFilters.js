import React from 'react';
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
    Chip,
    Paper
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

export const GENEROS = [
    'Ficción',
    'No Ficción',
    'Fantasía',
    'Ciencia Ficción',
    'Romance',
    'Misterio',
    'Drama',
    'Historia',
    'Biografía',
    'Educación'
];

const BookFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <TextField
                    name="search"
                    label="Buscar"
                    variant="outlined"
                    size="small"
                    value={filters.search || ''}
                    onChange={handleChange}
                    sx={{ minWidth: 200 }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Género</InputLabel>
                    <Select
                        name="genero"
                        value={filters.genero || ''}
                        label="Género"
                        onChange={handleChange}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {GENEROS.map(genero => (
                            <MenuItem key={genero} value={genero}>
                                {genero}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Disponibilidad</InputLabel>
                    <Select
                        name="disponible"
                        value={filters.disponible || ''}
                        label="Disponibilidad"
                        onChange={handleChange}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Disponibles</MenuItem>
                        <MenuItem value="false">No disponibles</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={onClearFilters}
                    size="small"
                >
                    Limpiar
                </Button>
            </Box>

            {/* Mostrar filtros activos */}
            {Object.entries(filters).some(([_, value]) => value) && (
                <Box display="flex" gap={1} mt={2}>
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null;
                        return (
                            <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                onDelete={() => onFilterChange({ ...filters, [key]: '' })}
                                size="small"
                            />
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
};

export default BookFilters; 