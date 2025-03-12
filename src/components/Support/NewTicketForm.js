import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';

const NewTicketForm = () => {
    const [formData, setFormData] = useState({
        asunto: '',
        mensaje: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/support/tickets`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess('Ticket creado exitosamente');
            setFormData({ asunto: '', mensaje: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el ticket');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="asunto"
                label="Asunto"
                name="asunto"
                autoFocus
                value={formData.asunto}
                onChange={handleChange}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="mensaje"
                label="Mensaje"
                id="mensaje"
                multiline
                rows={4}
                value={formData.mensaje}
                onChange={handleChange}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!formData.asunto || !formData.mensaje}
            >
                Crear Ticket
            </Button>
        </Box>
    );
};

export default NewTicketForm; 