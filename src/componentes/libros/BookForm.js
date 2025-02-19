import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  useToast
} from '@chakra-ui/react';

const BookForm = ({ bookId, onSuccess }) => {
  const [book, setBook] = useState({
    titulo: '',
    autor: '',
    descripcion: '',
    genero: '',
    portada: '',
    lecturaUrl: '',
    sinopsis: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`/api/libros/${bookId}`);
      if (response.data.success) {
        setBook(response.data.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los detalles del libro',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = bookId
        ? await axios.put(`/api/libros/${bookId}`, book)
        : await axios.post('/api/libros', book);

      if (response.data.success) {
        toast({
          title: 'Éxito',
          description: bookId ? 'Libro actualizado correctamente' : 'Libro creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al procesar la solicitud',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Título</FormLabel>
          <Input
            name="titulo"
            value={book.titulo}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Autor</FormLabel>
          <Input
            name="autor"
            value={book.autor}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="descripcion"
            value={book.descripcion}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Sinopsis</FormLabel>
          <Textarea
            name="sinopsis"
            value={book.sinopsis}
            onChange={handleInputChange}
            placeholder="Ingrese la sinopsis del libro"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Género</FormLabel>
          <Input
            name="genero"
            value={book.genero}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>URL de la Portada</FormLabel>
          <Input
            name="portada"
            value={book.portada}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </FormControl>

        <FormControl>
          <FormLabel>URL de Lectura/Descarga</FormLabel>
          <Input
            name="lecturaUrl"
            value={book.lecturaUrl}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/libro.pdf"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={loading}
        >
          {bookId ? 'Actualizar Libro' : 'Crear Libro'}
        </Button>
      </Stack>
    </Box>
  );
};

export default BookForm;